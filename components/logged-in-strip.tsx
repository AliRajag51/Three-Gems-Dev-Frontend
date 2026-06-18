"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Gem, LayoutDashboard, KeyRound, Globe, RefreshCw, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/context/auth.context";
import { useMyLicenses } from "@/lib/hooks/license.hooks";
import { useMySubscriptions } from "@/lib/hooks/subscription.hooks";
import { usePlugins } from "@/lib/hooks/plugin.hooks";
import { getPlanPricing } from "@/lib/pricing";
import type { PluginListItem } from "@/lib/types/plugin";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/**
 * Personalized home header shown INSTEAD of the marketing hero when the user is
 * signed in. Everything here is real data — no mock ratings/activity counts.
 */
export function LoggedInStrip() {
  const { user } = useAuth();
  const { data: licenses, isLoading: licLoading } = useMyLicenses(!!user);
  const { data: subscriptions, isLoading: subsLoading } = useMySubscriptions(!!user);
  const { data: plugins, isLoading: pluginsLoading } = usePlugins();

  const statsLoading = licLoading || subsLoading;

  const now = Date.now();

  const activeLicenses = useMemo(
    () =>
      (licenses ?? []).filter(
        (l) => l.status === "ACTIVE" && (!l.expiresAt || new Date(l.expiresAt).getTime() > now),
      ),
    [licenses, now],
  );

  const sitesUsed = useMemo(
    () => activeLicenses.reduce((n, l) => n + l.domains.length, 0),
    [activeLicenses],
  );
  const siteLimitTotal = useMemo(
    () => activeLicenses.reduce((n, l) => n + (l.siteLimit === 0 ? 0 : l.siteLimit), 0),
    [activeLicenses],
  );
  const hasUnlimited = activeLicenses.some((l) => l.siteLimit === 0);

  const activeSubs = useMemo(
    () => (subscriptions ?? []).filter((s) => s.status === "ACTIVE"),
    [subscriptions],
  );

  // Soonest upcoming renewal among active subscriptions (for the 4th, amber card).
  const nextRenewal = useMemo(
    () =>
      activeSubs
        .map((s) => s.currentPeriodEnd)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0] ?? null,
    [activeSubs],
  );

  // One-time = active licenses whose plugin has no active subscription.
  const oneTime = useMemo(() => {
    const subPluginIds = new Set(activeSubs.map((s) => s.plugin.id));
    return activeLicenses.filter((l) => !subPluginIds.has(l.plugin.id)).length;
  }, [activeLicenses, activeSubs]);

  const ownedIds = useMemo(() => new Set(activeLicenses.map((l) => l.plugin.id)), [activeLicenses]);
  const recommended = useMemo(
    () => (plugins ?? []).filter((p) => !ownedIds.has(p.id)).slice(0, 3),
    [plugins, ownedIds],
  );

  const firstName = user?.name?.split(" ")[0] || "there";

  // Cheapest plan's real pricing for this viewer (best-wins discount), mirroring the
  // plugin cards — returns the full pricing object so we can show the strikethrough + %.
  const priceFrom = (p: PluginListItem) => {
    let best: ReturnType<typeof getPlanPricing> | null = null;
    for (const plan of p.plans) {
      const pricing = getPlanPricing(plan, p.discountSettings, user);
      if (!best || pricing.final < best.final) best = pricing;
    }
    return best;
  };

  return (
    <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-primary-soft/50 to-background">
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40 [mask-image:radial-gradient(70%_60%_at_40%_0%,black,transparent)]" />
      <div className="pointer-events-none hidden sm:block absolute -top-28 left-1/3 w-[34rem] h-[28rem] rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-20 pb-7 sm:py-10 lg:pt-34 lg:pb-14">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Welcome back, {firstName}
            </span>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Your store, running on Three&nbsp;Gems
            </h1>
          </div>
          <Link
            href="/account/plugins"
            className="btn-ruby px-5 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" /> Manage plugins
          </Link>
        </div>

        {/* Stat cards (all real data) */}
        <div className="mt-7 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StripStatSkeleton key={i} />)
          ) : (
            <>
              <StripStat
                icon={<KeyRound className="w-5 h-5" />}
                value={String(activeLicenses.length)}
                label="Active licenses"
              />
              <StripStat
                icon={<Globe className="w-5 h-5" />}
                value={hasUnlimited ? `${sitesUsed} / ∞` : `${sitesUsed} / ${siteLimitTotal}`}
                label="Site activations"
              />
              <StripStat
                icon={<RefreshCw className="w-5 h-5" />}
                value={String(activeSubs.length)}
                label="Subscriptions"
              />
              {nextRenewal ? (
                <StripStat
                  amber
                  icon={<RefreshCw className="w-5 h-5" />}
                  value={fmtDate(nextRenewal)}
                  label="Next renewal"
                />
              ) : (
                <StripStat
                  icon={<KeyRound className="w-5 h-5" />}
                  value={String(oneTime)}
                  label="One-time licenses"
                />
              )}
            </>
          )}
        </div>

        {/* Recommended */}
        {(pluginsLoading || recommended.length > 0) && (
          <div className="mt-5 card-surface p-5">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="w-4 h-4" /> Recommended for your stack
            </span>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {pluginsLoading
                ? Array.from({ length: 3 }).map((_, i) => <RecoRowSkeleton key={i} />)
                : recommended.map((p) => {
                const best = priceFrom(p);
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 min-w-0 w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)] hover:border-primary/40 hover:shadow-soft transition-all"
                  >
                    {p.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.iconUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary to-primary-deep grid place-items-center shrink-0">
                        <Gem className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-sm font-semibold truncate min-w-0">{p.name}</p>
                        {best?.hasDiscount && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                            −{best.percent}%
                          </span>
                        )}
                      </div>
                      {best ? (
                        <p className="text-xs text-muted-foreground flex items-baseline flex-wrap gap-x-1.5">
                          <span>From</span>
                          <span className="font-semibold text-foreground">${best.final}</span>
                          {best.hasDiscount && <span className="line-through">${best.original}</span>}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">View plans</p>
                      )}
                    </div>
                    <Link
                      href={`/plugins/${p.slug}`}
                      className="btn-ruby px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0"
                    >
                      View
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function StripStat({
  icon,
  value,
  label,
  amber,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  amber?: boolean;
}) {
  return (
    <Link
      href="/account/plugins"
      className={`group card-surface p-5 hover:-translate-y-0.5 hover:shadow-elevated transition-all duration-300 ${
        amber ? "border-amber-300/60 bg-amber-50/50" : ""
      }`}
    >
      <span
        className={`w-11 h-11 rounded-xl grid place-items-center ${
          amber ? "bg-amber-100 text-amber-600" : "icon-tile"
        }`}
      >
        {icon}
      </span>
      <p className="mt-3 font-display text-2xl font-extrabold leading-none">{value}</p>
      <p className="text-sm text-muted-foreground mt-1.5">{label}</p>
    </Link>
  );
}

/* ---------- Loading skeletons ---------- */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted-foreground/20 ${className}`} />;
}

function StripStatSkeleton() {
  return (
    <div className="card-surface p-5">
      <Bar className="w-11 h-11 rounded-xl" />
      <Bar className="mt-3 h-7 w-16" />
      <Bar className="mt-2.5 h-3.5 w-24" />
    </div>
  );
}

function RecoRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3 w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)]">
      <Bar className="w-10 h-10 rounded-lg shrink-0" />
      <div className="min-w-0 flex-1">
        <Bar className="h-3.5 w-2/3" />
        <Bar className="mt-2 h-3 w-1/3" />
      </div>
      <Bar className="h-7 w-14 rounded-lg shrink-0" />
    </div>
  );
}
