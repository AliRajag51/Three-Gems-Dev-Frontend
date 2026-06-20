"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Check, Download, BookOpen,
  LifeBuoy, ChevronDown, Gem, Loader2, Zap,
  ImageOff, MessageCircle, History, ShieldCheck,

  KeyRound, Copy, CheckCheck, X, ChevronLeft, ChevronRight, Maximize2, Eye, EyeOff, AlertTriangle,
} from "lucide-react";
import type { Screenshot } from "@/lib/types/plugin";
import { usePlugin } from "@/lib/hooks/plugin.hooks";
import { useMyLicenses } from "@/lib/hooks/license.hooks";
import { useMySubscriptions } from "@/lib/hooks/subscription.hooks";
import { getDownloadUrlService } from "@/lib/services/license.service";
import { cancelSubscriptionService } from "@/lib/services/subscription.service";
import type { Plan } from "@/lib/types/plugin";
import { getPlanPricing } from "@/lib/pricing";
import { youtubeEmbedUrl } from "@/lib/youtube";
import { DiscountCountdown } from "@/components/discount-countdown";
import { useAuth } from "@/lib/context/auth.context";
import { LoginRequiredModal } from "@/components/auth/login-required-modal";
import { useVerifyAuth } from "@/lib/hooks/auth.hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { PluginDetailSkeleton } from "@/components/skeletons/plugin-detail-skeleton";

const tabs = ["Features", "Screenshots", "Compatibility", "Changelog", "FAQs"] as const; // "Reviews" hidden for now
type Tab = (typeof tabs)[number];

// Show the exact price (e.g. 6.5, 13) — never round to a whole dollar. Cleans
// any float drift to 2 decimals and drops trailing zeros, matching the cards.
const money = (n: number) => (Math.round(n * 100) / 100).toString();

export function PluginDetail({ slug }: { slug: string }) {
  const { data: plugin, isLoading, isError, error } = usePlugin(slug);
  const [tab, setTab] = useState<Tab>("Features");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { user, setUser } = useAuth();
  const router = useRouter();
  const verifyAuth = useVerifyAuth();

  const activePlan = selectedPlan ?? plugin?.plans?.[0] ?? null;
  const { data: licenses } = useMyLicenses(!!user);
  const { data: subscriptions } = useMySubscriptions(!!user);
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [copied, setCopied] = useState(false);
  const [revealKey, setRevealKey] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleBuyNow = async () => {
    try {
      const res = await verifyAuth();
      setUser(res.data.user);
      router.push(`/checkout?plugin=${slug}&plan=${activePlan?.id}`);
    } catch {
      setUser(null);
      setShowLoginModal(true);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    setCancelling(true);
    try {
      await cancelSubscriptionService(subscriptionId);
      qc.invalidateQueries({ queryKey: ["my-subscriptions"] });
    } catch {
      // show nothing — subscription data will refresh naturally
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) {
    return <PluginDetailSkeleton />;
  }

  if (isError || !plugin) {
    // 403 = the plugin exists but the admin deactivated it; anything else = not found.
    const status = (error as { response?: { status?: number } } | null)?.response?.status;
    const inactive = status === 403;
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-3 text-center px-5">
        <p className="text-muted-foreground">
          {inactive ? "This plugin is currently not active." : "Plugin not found."}
        </p>
        <Link href="/plugins" className="text-primary text-sm font-semibold">
          ← Back to plugins
        </Link>
      </div>
    );
  }

  const planIntervalLabel = (plan: Plan) => {
    if (plan.billingType === "RECURRING" && plan.billingIntervalUnit) {
      const unit = plan.billingIntervalUnit.toLowerCase();
      const count = plan.billingIntervalCount ?? 1;
      return count === 1 ? `/${unit}` : `/${count} ${unit}s`;
    }
    if (plan.durationDays === 0) return "/lifetime";
    if (plan.durationDays === 365) return "/year";
    return `/${plan.durationDays}d`;
  };

  const pricing = activePlan ? getPlanPricing(activePlan, plugin.discountSettings, user) : null;

  const license = licenses?.find(
    (l) =>
      l.plugin.id === plugin.id &&
      l.status === "ACTIVE" &&
      (!l.expiresAt || new Date(l.expiresAt) > new Date()),
  );

  // PENDING subscriptions are ignored — treated as if the user never subscribed
  const activeSubscription = subscriptions?.find(
    (s) => s.plugin.id === plugin.id && s.status === "ACTIVE",
  );

  const isRecurringPlan = activePlan?.billingType === "RECURRING";

  // The plan the user currently holds for this plugin — from a one-time license OR an
  // active subscription. This is the SINGLE source of truth for "Current"; leftover
  // CANCELLED subscription rows from past upgrades are never treated as current.
  // Tier rank = list price (priceUsd), so discounts never affect it.
  const heldPlanId = license?.plan.id ?? activeSubscription?.plan.id ?? null;
  const heldPlan = heldPlanId ? plugin.plans.find((p) => p.id === heldPlanId) : undefined;
  const heldPrice = heldPlan ? Number(heldPlan.priceUsd) : null;
  const activePrice = activePlan ? Number(activePlan.priceUsd) : null;

  const isCurrentTier = !!heldPlanId && activePlan?.id === heldPlanId;
  // Held via the active subscription (vs a one-time license) → Subscribed/Cancel vs Purchased.
  const heldViaSubscription = !!activeSubscription && activeSubscription.plan.id === heldPlanId;
  const isLowerTier = !isCurrentTier && heldPrice != null && activePrice != null && activePrice < heldPrice;
  const isHigherTier = !!heldPlanId && heldPrice != null && activePrice != null && activePrice > heldPrice;

  // The user holds a plan but it isn't in plugin.plans (admin deactivated/hid that
  // tier) → heldPrice is null, so inclusion can't be computed. Treat ownership as
  // indeterminate and suppress the countdown rather than risk showing it on a plan
  // the user already owns/includes.
  const ownershipUnknown = !!heldPlanId && heldPrice == null;

  // The selected plan is already owned (held) or bundled into a higher tier the user
  // holds → the limited-time discount countdown is irrelevant, so we hide it for it.
  const activePlanOwned = isCurrentTier || isLowerTier || ownershipUnknown;

  // The HELD tier's subscription was cancelled but is still valid (won't renew). Only the
  // held tier shows this — old cancelled subs from past upgrades/switches are ignored.
  const cancelledSubscription =
    !activeSubscription && isCurrentTier
      ? subscriptions?.find(
          (s) =>
            s.plugin.id === plugin.id &&
            s.status === "CANCELLED" &&
            s.plan.id === activePlan?.id &&
            new Date(s.currentPeriodEnd) > new Date(),
        )
      : undefined;

  const copyKey = () => {
    if (!license) return;
    navigator.clipboard.writeText(license.licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!license) return;
    setDownloading(true);
    try {
      const { downloadUrl, filename } = await getDownloadUrlService(license.licenseKey);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      a.click();
    } catch {
      // file not available yet
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-10 pb-28 lg:pb-10 lg:grid lg:grid-cols-3 lg:gap-10 lg:items-start">

        {/* ── Left column: info + tabs ── */}
        <div className="lg:col-span-2">

          {/* Plugin header */}
          <Link href="/plugins" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← All plugins
          </Link>
          <div className="mt-5 flex items-start gap-4">
            {plugin.iconUrl ? (
              <img src={plugin.iconUrl} alt={plugin.name} className="w-16 h-16 rounded-2xl object-cover shadow-md border border-border shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-primary-deep grid place-items-center shadow-md shrink-0">
                <Gem className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight">{plugin.name}</h1>
              <p className="mt-1.5 text-base text-muted-foreground">{plugin.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="font-mono font-semibold text-foreground">v{plugin.version}</span>
                {plugin.changelogs[0]?.releaseDate && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>
                      Updated {new Date(plugin.changelogs[0].releaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </>
                )}
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified &amp; secure
                </span>
              </div>

              {license && (
                <div className="mt-5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                    Your license · <span className="text-emerald-600">{license.plan.name}</span>
                    <span className="mx-1.5 text-border">·</span>
                    <span className="font-medium normal-case text-muted-foreground">
                      {license.expiresAt
                        ? `Expires ${new Date(license.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                        : "Lifetime"}
                    </span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/30">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className={`text-xs font-mono text-emerald-700 ${revealKey ? "select-all" : "select-none tracking-wider"}`}>
                        {revealKey ? license.licenseKey : "••••••••"}
                      </span>
                      <button
                        onClick={() => setRevealKey((v) => !v)}
                        title={revealKey ? "Hide license key" : "Show license key"}
                        className="text-emerald-600 hover:text-emerald-700 transition-colors p-0.5 rounded ml-1"
                      >
                        {revealKey
                          ? <EyeOff className="w-3.5 h-3.5" />
                          : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={copyKey}
                        title="Copy license key"
                        className="text-emerald-600 hover:text-emerald-700 transition-colors p-0.5 rounded"
                      >
                        {copied
                          ? <CheckCheck className="w-3.5 h-3.5" />
                          : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="btn-ruby flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
                    >
                      {downloading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Download className="w-4 h-4" />}
                      Download v{plugin.files[0]?.version ?? plugin.version}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video — admin-managed YouTube embed, between the header and the tabs */}
          {youtubeEmbedUrl(plugin.videoUrl) && (
            <div className="mt-8">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow-sm">
                <iframe
                  src={youtubeEmbedUrl(plugin.videoUrl)!}
                  title={`${plugin.name} — video`}
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Tab bar */}
          <div className="flex gap-0 overflow-x-auto border-b border-border mt-8">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="py-8 min-h-[360px]">

            {tab === "Features" && (
              plugin.features.length > 0 ? (
                <ul className="grid sm:grid-cols-2 gap-3">
                  {[...plugin.features].sort((a, b) => a.sortOrder - b.sortOrder).map((f) => (
                    <li key={f.id} className="group flex items-start gap-4 p-5 rounded-2xl bg-surface border border-border hover:border-primary/30 hover:shadow-sm transition-all">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 grid place-items-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-sm font-semibold leading-snug mt-1">{f.text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <TabEmpty icon={Zap} title="No features listed yet" desc="Feature highlights will appear here once added." />
              )
            )}

            {tab === "Screenshots" && (
              plugin.screenshots.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-5">
                  {[...plugin.screenshots].sort((a, b) => a.sortOrder - b.sortOrder).map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setLightboxIndex(i)}
                      className="group relative rounded-2xl border border-border overflow-hidden bg-surface hover:border-primary/30 hover:shadow-md transition-all text-left"
                    >
                      <div className="aspect-video bg-muted overflow-hidden">
                        <img src={s.r2FilePath} alt={s.caption ?? "Screenshot"} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                      </div>
                      <span className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="w-4 h-4 text-white" />
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <TabEmpty icon={ImageOff} title="No screenshots yet" desc="Screenshots will be added here soon." />
              )
            )}

            {tab === "Compatibility" && (
              plugin.compatibility.length > 0 ? (
                <div className="rounded-2xl border border-border overflow-hidden">
                  <div className="grid grid-cols-2 px-5 py-2.5 bg-muted border-b border-border">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Software</span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Version</span>
                  </div>
                  {[...plugin.compatibility].sort((a, b) => a.sortOrder - b.sortOrder).map((c, i, arr) => (
                    <div key={c.id} className={`grid grid-cols-2 px-5 py-3.5 items-center hover:bg-muted/40 transition-colors ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-sm font-semibold">{c.software}</span>
                      </div>
                      <span className="text-sm text-muted-foreground font-mono">{c.versionInfo}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <TabEmpty icon={ShieldCheck} title="No compatibility info yet" desc="Supported platforms and versions will be listed here." />
              )
            )}

            {tab === "Changelog" && (
              plugin.changelogs.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-5 top-6 bottom-6 w-px bg-border" />
                  <div className="space-y-5">
                    {[...plugin.changelogs].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()).map((c, i) => (
                      <div key={c.id} className="flex gap-5">
                        <div className={`w-10 h-10 rounded-full border-2 grid place-items-center shrink-0 z-10 ${i === 0 ? "bg-primary border-primary text-white" : "bg-background border-border text-muted-foreground"}`}>
                          <History className="w-4 h-4" />
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="card-surface p-5">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2.5">
                                <span className="font-display font-bold text-lg">v{c.version}</span>
                                {i === 0 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Latest</span>}
                              </div>
                              <span className="text-xs text-muted-foreground">{new Date(c.releaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                            {c.items.length > 0 ? (
                              <ul className="space-y-2">
                                {[...c.items].sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
                                  <li key={item.id} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                    <span className="text-primary shrink-0 mt-0.5">•</span>{item.note}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">No release notes added.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <TabEmpty icon={History} title="No changelog yet" desc="Release history and update notes will appear here." />
              )
            )}

            {tab === "FAQs" && (
              plugin.faqs.length > 0 ? (
                <div className="space-y-2">
                  {[...plugin.faqs].sort((a, b) => a.sortOrder - b.sortOrder).map((f) => (
                    <FAQ key={f.id} q={f.question} a={f.answer} />
                  ))}
                </div>
              ) : (
                <TabEmpty icon={MessageCircle} title="No FAQs yet" desc="Frequently asked questions will be listed here." />
              )
            )}

            {/* Reviews tab hidden for now
            {tab === "Reviews" && <TabEmpty icon={Star} title="No reviews yet" desc="Be the first to purchase and leave a review." />} */}

          </div>
        </div>

        {/* ── Right column: price card + need help (sticky on desktop, in-flow on mobile) ── */}
        <div id="plans-card" className="flex flex-col gap-4 mt-8 lg:mt-0 lg:sticky lg:top-8 scroll-mt-24">

          {/* Price card */}
          <div className="card-surface p-6">
            {activePlan && pricing ? (
              <>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {pricing.hasDiscount ? "Now" : "Starting at"}
                  </p>
                  {pricing.hasDiscount && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      −{pricing.percent}%
                    </span>
                  )}
                </div>
                <p className="mt-1 font-display text-4xl font-bold flex items-baseline gap-2">
                  <span>${money(pricing.final)}</span>
                  <span className="text-base font-medium text-muted-foreground">{planIntervalLabel(activePlan)}</span>
                </p>
                {pricing.hasDiscount && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    <span className="line-through">${money(pricing.original)}</span>
                    <span className="ml-2 text-primary font-semibold">Save ${money(pricing.original - pricing.final)}</span>
                  </p>
                )}
                {/* Limited-time discount countdown — hidden once the plan is owned/included. */}
                {!activePlanOwned && <DiscountCountdown plan={activePlan} settings={plugin.discountSettings} user={user} className="mt-2" />}
                <div className="mt-5 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">License</p>
                  {plugin.plans.map((plan) => {
                    const pp = getPlanPricing(plan, plugin.discountSettings, user);
                    // "Current" = the tier the license says you hold — NOT leftover cancelled subs.
                    const isHeld = !!heldPlanId && plan.id === heldPlanId;
                    // Lower tier than the one the user holds → bundled in.
                    const includedByHigher =
                      heldPrice != null && Number(plan.priceUsd) < heldPrice && plan.id !== heldPlanId;
                    // Renew/expiry info only for the tier the user actually holds.
                    const planSub = isHeld
                      ? subscriptions?.find(
                          (s) =>
                            s.plugin.id === plugin.id &&
                            s.plan.id === plan.id &&
                            (s.status === "ACTIVE" ||
                              (s.status === "CANCELLED" && new Date(s.currentPeriodEnd) > new Date())),
                        )
                      : undefined;

                    return (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${activePlan.id === plan.id ? "border-primary bg-primary-soft" : "border-border hover:border-primary/40"}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold flex items-center gap-1.5">
                            {plan.name}
                            {isHeld && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700">
                                Current
                              </span>
                            )}
                            {includedByHigher && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                Included
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">{plan.siteLimit === 0 ? "Unlimited" : `${plan.siteLimit} site${plan.siteLimit > 1 ? "s" : ""}`}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <span className="font-semibold">${money(pp.final)}{planIntervalLabel(plan)}</span>
                          {pp.hasDiscount && <span className="line-through text-muted-foreground">${money(pp.original)}</span>}
                          {/* Countdown pushed to the far right of the price row (buyable plans only). */}
                          {!isHeld && !includedByHigher && !ownershipUnknown && <DiscountCountdown plan={plan} settings={plugin.discountSettings} user={user} className="ml-auto shrink-0" />}
                        </div>
                        {isHeld && planSub?.status === "ACTIVE" && (
                          <p className="mt-1 text-[11px] font-medium text-emerald-700">
                            Renews {new Date(planSub.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                        {isHeld && planSub?.status === "CANCELLED" && (
                          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                            Expires {new Date(planSub.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                        {isHeld && !planSub && license?.plan.id === plan.id && (
                          <p className="mt-1 text-[11px] font-medium text-emerald-700">
                            {license.expiresAt
                              ? `Expires ${new Date(license.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                              : "Lifetime license"}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
                {isCurrentTier && heldViaSubscription ? (
                  <div className="mt-5 space-y-2">
                    <div className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                      <CheckCheck className="w-4 h-4" />
                      Subscribed
                    </div>
                    <button
                      onClick={async () => {
                        const ok = await confirm({
                          title: "Cancel subscription?",
                          description: (
                            <>
                              Your subscription <strong>won&apos;t renew</strong> — you won&apos;t be charged again.
                              Your license <strong>stays active until {new Date(activeSubscription!.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong>, then access ends.
                            </>
                          ),
                          confirmLabel: "Cancel subscription",
                          cancelLabel: "Keep subscription",
                          tone: "danger",
                        });
                        if (ok) handleCancelSubscription(activeSubscription!.paypalSubscriptionId);
                      }}
                      disabled={cancelling}
                      className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors py-1 flex items-center justify-center gap-1"
                    >
                      {cancelling && <Loader2 className="w-3 h-3 animate-spin" />}
                      Cancel subscription
                    </button>
                  </div>
                ) : cancelledSubscription ? (
                  <div
                    title="Your subscription is cancelled and will not renew"
                    className="mt-5 w-full flex flex-col items-center gap-0.5 px-5 py-3 rounded-xl text-sm font-bold bg-muted text-muted-foreground border border-border cursor-not-allowed"
                  >
                    <span className="flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Subscription cancelled
                    </span>
                    <span className="text-xs font-normal">
                      Won&apos;t renew · access until {new Date(cancelledSubscription.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                ) : isCurrentTier ? (
                  <div className="mt-5 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                    <CheckCheck className="w-4 h-4" /> Purchased
                  </div>
                ) : isLowerTier ? (
                  <button
                    disabled
                    title="Your current plan already includes this tier"
                    className="mt-5 w-full px-5 py-3 rounded-xl text-sm font-semibold bg-muted text-muted-foreground cursor-not-allowed"
                  >
                    Included in your current plan
                  </button>
                ) : (
                  <>
                    <button onClick={handleBuyNow} className="btn-ruby mt-5 w-full block text-center px-5 py-3 rounded-xl text-sm font-semibold">
                      {isHigherTier
                        ? isRecurringPlan
                          ? `Upgrade to ${activePlan.name} — $${money(pricing.final)}${planIntervalLabel(activePlan)}`
                          : `Upgrade — $${money(pricing.final)}`
                        : isRecurringPlan
                        ? `Subscribe — $${money(pricing.final)}${planIntervalLabel(activePlan)}`
                        : `Buy Now — $${money(pricing.final)}`}
                    </button>
                    {isHigherTier && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300/80 bg-amber-50 px-3.5 py-2.5">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <p className="text-xs font-semibold leading-snug text-amber-800">
                          {isRecurringPlan
                            ? `Upgrading cancels your current plan and starts ${activePlan.name} (${activePlan.siteLimit === 0 ? "unlimited sites" : `${activePlan.siteLimit} site${activePlan.siteLimit > 1 ? "s" : ""}`}).`
                            : `Upgrading sets your license to ${activePlan.siteLimit === 0 ? "unlimited sites" : `${activePlan.siteLimit} site${activePlan.siteLimit > 1 ? "s" : ""}`} and renews it ${activePlan.durationDays === 0 ? "for life" : `for ${activePlan.durationDays} days`} from today.`}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No plans available yet.</p>
            )}
            <div className="mt-5 pt-5 border-t border-border space-y-2.5">
              <Row icon={Download} text="Updates while your license is active" />
              <Row icon={LifeBuoy} text="Email support while active" />
              <Row icon={BookOpen} text="Detailed documentation" />
              <Row icon={Check} text="Renews at the same price" />
            </div>
            <div className="mt-5 pt-5 border-t border-border flex gap-3 text-xs">
              <Link href="/support" className="text-primary font-semibold hover:underline">Support</Link>
            </div>
          </div>

          {/* Need help card — commented out
          <div className="card-surface p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 grid place-items-center shrink-0">
                <LifeBuoy className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">Need help?</p>
                <p className="text-xs text-muted-foreground">Reply within 6 hours</p>
              </div>
            </div>
            <Link href="/support" className="btn-ruby flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold">
              <MessageCircle className="w-3.5 h-3.5" /> Contact Support
            </Link>
            <Link href="/docs" className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-border hover:border-primary hover:text-primary transition-colors">
              <BookOpen className="w-3.5 h-3.5" /> View Documentation
            </Link>
          </div>
          */}

        </div>
      </div>

      {/* Mobile sticky action bar — the full price card is in-flow below on mobile */}
      {activePlan && pricing && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-between gap-4 border-t border-border bg-surface/95 px-5 py-3 backdrop-blur">
          <div>
            <p className="text-[11px] text-muted-foreground leading-none">From</p>
            <p className="mt-0.5 font-display text-xl font-bold leading-none">
              ${money(pricing.final)}
              <span className="text-xs font-medium text-muted-foreground">{planIntervalLabel(activePlan)}</span>
            </p>
          </div>
          <a href="#plans-card" className="btn-ruby px-5 py-3 rounded-xl text-sm font-semibold">
            {license || activeSubscription ? "Manage" : "See plans"}
          </a>
        </div>
      )}

      {showLoginModal && (
        <LoginRequiredModal onClose={() => setShowLoginModal(false)} />
      )}


      {lightboxIndex !== null && (
        <ScreenshotLightbox
          screenshots={[...plugin.screenshots].sort((a, b) => a.sortOrder - b.sortOrder)}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}

function ScreenshotLightbox({
  screenshots, index, onClose, onNavigate,
}: {
  screenshots: Screenshot[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const [zoom, setZoom] = useState(false);
  const total = screenshots.length;
  const current = screenshots[index];

  useEffect(() => { setZoom(false); }, [index]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
      else if (e.key === "ArrowRight" && index < total - 1) onNavigate(index + 1);
    };
    window.addEventListener("keydown", handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, total, onClose, onNavigate]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      <div
        onClick={onClose}
        className="absolute inset-0 overflow-auto overscroll-contain"
        style={{ touchAction: "pinch-zoom pan-x pan-y" }}
      >
        <div className="min-h-full min-w-full flex items-center justify-center p-4 sm:p-12">
          <img
            src={current.r2FilePath}
            alt={current.caption ?? "Screenshot"}
            draggable={false}
            onClick={(e) => { e.stopPropagation(); setZoom((z) => !z); }}
            className={
              zoom
                ? "max-w-none select-none cursor-zoom-out transition-transform duration-200"
                : "max-h-[85vh] max-w-[92vw] object-contain select-none cursor-zoom-in transition-transform duration-200"
            }
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-auto absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-xs text-white font-mono select-none">
          {index + 1} / {total}
        </div>

        <button
          onClick={onClose}
          aria-label="Close"
          className="pointer-events-auto absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur grid place-items-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {index > 0 && (
          <button
            onClick={() => onNavigate(index - 1)}
            aria-label="Previous"
            className="pointer-events-auto hidden sm:grid absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur place-items-center text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {index < total - 1 && (
          <button
            onClick={() => onNavigate(index + 1)}
            aria-label="Next"
            className="pointer-events-auto hidden sm:grid absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur place-items-center text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {total > 1 && (
          <div className="pointer-events-auto sm:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-2 py-1.5 rounded-full bg-white/10 backdrop-blur">
            <button
              onClick={() => index > 0 && onNavigate(index - 1)}
              disabled={index === 0}
              aria-label="Previous"
              className="w-9 h-9 rounded-full grid place-items-center text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs text-white font-mono px-1">{index + 1} / {total}</span>
            <button
              onClick={() => index < total - 1 && onNavigate(index + 1)}
              disabled={index === total - 1}
              aria-label="Next"
              className="w-9 h-9 rounded-full grid place-items-center text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ icon: Icon, text }: { icon: typeof Check; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="w-4 h-4 text-primary" />
      <span>{text}</span>
    </div>
  );
}

function TabEmpty({ icon: Icon, title, desc }: { icon: typeof Check; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted grid place-items-center">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left card-surface p-5 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold">{q}</span>
        <ChevronDown className={`w-5 h-5 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </div>
      {open && <p className="mt-3 text-sm text-muted-foreground">{a}</p>}
    </button>
  );
}
//its me akif