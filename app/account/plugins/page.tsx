"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2, Gem, Globe, KeyRound, Copy, CheckCheck, X, ExternalLink,
  PackageOpen, ChevronDown, Search, RefreshCw, Layers, Infinity as InfinityIcon, Eye, EyeOff, Download,
} from "lucide-react";
import { useAuth } from "@/lib/context/auth.context";
import { useMyLicenses, useDeactivateDomain } from "@/lib/hooks/license.hooks";
import { useMySubscriptions } from "@/lib/hooks/subscription.hooks";
import { cancelSubscriptionService } from "@/lib/services/subscription.service";
import { getDownloadUrlService } from "@/lib/services/license.service";
import { useConfirm } from "@/components/ui/confirm-dialog";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const toHref = (d: string) => (d.startsWith("http") ? d : `https://${d}`);

type FilterKey = "all" | "subs" | "onetime" | "cancelled";

export default function MyPluginsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Login-only page.
  useEffect(() => {
    if (!authLoading && !user) router.replace("/account/login?redirect=/account/plugins");
  }, [authLoading, user, router]);

  // Two parallel queries (cached 60s globally) — fast, and only run when signed in.
  const { data: licenses, isLoading: licLoading } = useMyLicenses(!!user);
  const { data: subscriptions } = useMySubscriptions(!!user);

  const qc = useQueryClient();
  const confirm = useConfirm();
  const deactivate = useDeactivateDomain();
  const cancelSub = useMutation({
    mutationFn: (paypalSubscriptionId: string) => cancelSubscriptionService(paypalSubscriptionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-subscriptions"] }),
  });

  const [copied, setCopied] = useState<string | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const handleDownload = async (licenseKey: string) => {
    setDownloadingKey(licenseKey);
    try {
      const { downloadUrl, filename } = await getDownloadUrlService(licenseKey);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      a.click();
    } catch {
      toast.error("Download isn't available yet for this plugin.");
    } finally {
      setDownloadingKey(null);
    }
  };

  const now = Date.now();

  // Build a row model joining each usable license with its subscription state.
  const rows = useMemo(() => {
    const subs = subscriptions ?? [];
    const activeSubFor = (pid: string) => subs.find((s) => s.plugin.id === pid && s.status === "ACTIVE");
    const cancelledSubFor = (pid: string) =>
      subs.find((s) => s.plugin.id === pid && s.status === "CANCELLED" && new Date(s.currentPeriodEnd).getTime() > now);

    return (licenses ?? [])
      .filter((l) => l.status === "ACTIVE" && (!l.expiresAt || new Date(l.expiresAt).getTime() > now))
      .map((l) => {
        const sub = activeSubFor(l.plugin.id);
        const cancelledSub = !sub ? cancelledSubFor(l.plugin.id) : undefined;
        const kind: FilterKey = sub ? "subs" : cancelledSub ? "cancelled" : "onetime";
        return { l, sub, cancelledSub, kind, unlimited: l.siteLimit === 0 };
      });
  }, [licenses, subscriptions, now]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      subs: rows.filter((r) => r.kind === "subs").length,
      onetime: rows.filter((r) => r.kind === "onetime").length,
      cancelled: rows.filter((r) => r.kind === "cancelled").length,
    }),
    [rows],
  );

  const sitesUsed = useMemo(() => rows.reduce((n, r) => n + r.l.domains.length, 0), [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.kind !== filter) return false;
      if (q && !r.l.plugin.name.toLowerCase().includes(q) && !r.l.licenseKey.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, filter, query]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleReveal = (id: string) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const statusChip = (r: (typeof rows)[number]) => {
    if (r.sub) return { label: `Renews ${fmt(r.sub.currentPeriodEnd)}`, cls: "bg-emerald-500/15 text-emerald-700" };
    if (r.cancelledSub) return { label: `Ends ${fmt(r.cancelledSub.currentPeriodEnd)}`, cls: "bg-amber-500/15 text-amber-700" };
    if (!r.l.expiresAt) return { label: "Lifetime", cls: "bg-primary-soft text-primary-deep" };
    return { label: `Expires ${fmt(r.l.expiresAt)}`, cls: "bg-muted text-muted-foreground" };
  };

  const tabs: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "subs", label: "Subscriptions" },
    { key: "onetime", label: "One-time" },
    { key: "cancelled", label: "Cancelling" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">My Plugins</h1>
        <p className="mt-2 text-muted-foreground">Manage your licenses, activated sites, and subscriptions.</p>
      </div>

      {licLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <div className="card-surface p-12 text-center">
          <PackageOpen className="w-10 h-10 mx-auto text-muted-foreground/60" />
          <p className="mt-4 font-semibold">No active plugins</p>
          <p className="mt-1 text-sm text-muted-foreground">Plugins you purchase will appear here.</p>
          <Link href="/plugins" className="btn-ruby mt-5 inline-block px-5 py-2.5 rounded-xl text-sm font-semibold">
            Browse plugins
          </Link>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6">
            <Stat icon={<Layers className="w-4 h-4" />} value={rows.length} label="Plugins" />
            <Stat icon={<RefreshCw className="w-4 h-4" />} value={counts.subs} label="Subscriptions" />
            <Stat icon={<Globe className="w-4 h-4" />} value={sitesUsed} label="Sites active" />
          </div>

          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or license key…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-surface text-sm outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    filter === t.key
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t.label}
                  <span className={`ml-1.5 ${filter === t.key ? "opacity-80" : "opacity-60"}`}>{counts[t.key]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rows */}
          {visible.length === 0 ? (
            <div className="card-surface p-10 text-center text-sm text-muted-foreground">
              No plugins match your search.
            </div>
          ) : (
            <div className="space-y-2.5">
              {visible.map((r) => {
                const { l, sub, cancelledSub, unlimited } = r;
                const isOpen = open.has(l.id);
                const chip = statusChip(r);
                return (
                  <div
                    key={l.id}
                    className={`card-surface overflow-hidden relative transition-all duration-200 ${
                      isOpen ? "border-primary ring-2 ring-primary/25 shadow-elevated bg-primary-soft/40" : ""
                    }`}
                  >
                    {/* Ruby accent bar across the top of the open card */}
                    {isOpen && (
                      <span className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-primary to-primary-deep" />
                    )}
                    {/* Collapsed header — click to expand */}
                    <button
                      onClick={() => toggle(l.id)}
                      className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-muted/40 transition-colors"
                    >
                      {l.plugin.iconUrl ? (
                        <img src={l.plugin.iconUrl} alt={l.plugin.name} className="w-10 h-10 rounded-lg object-cover border border-border shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary to-primary-deep grid place-items-center shrink-0">
                          <Gem className="w-5 h-5 text-white" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold truncate">{l.plugin.name}</h2>
                          <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 shrink-0">
                            {l.plan.name}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${chip.cls}`}>{chip.label}</span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Globe className="w-3 h-3" />
                            {l.domains.length}/{unlimited ? <InfinityIcon className="w-3 h-3" /> : l.siteLimit}
                          </span>
                        </div>
                      </div>

                      <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Expanded body */}
                    {isOpen && (
                      <div className="px-4 pb-4 -mt-1">
                        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted min-w-0">
                            <KeyRound className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <code className={`text-xs truncate ${revealed.has(l.id) ? "select-all" : "select-none tracking-wider"}`}>
                              {revealed.has(l.id) ? l.licenseKey : "••••••••"}
                            </code>
                            <button
                              onClick={() => toggleReveal(l.id)}
                              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                              title={revealed.has(l.id) ? "Hide key" : "Show key"}
                            >
                              {revealed.has(l.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => copyKey(l.licenseKey)}
                              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                              title="Copy key"
                            >
                              {copied === l.licenseKey ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Download (same row as the key) */}
                          <button
                            onClick={() => handleDownload(l.licenseKey)}
                            disabled={downloadingKey === l.licenseKey}
                            className="btn-ruby inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
                          >
                            {downloadingKey === l.licenseKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            Download v{l.plugin.version}
                          </button>

                          <Link
                            href={`/plugins/${l.plugin.slug}`}
                            className="text-xs font-semibold text-primary inline-flex items-center gap-1 shrink-0 hover:gap-1.5 transition-all ml-auto"
                          >
                            View <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                        {/* Activated sites */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activated sites</p>
                            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                              {l.domains.length} / {unlimited ? <InfinityIcon className="w-3.5 h-3.5" /> : l.siteLimit} used
                            </span>
                          </div>
                          {l.domains.length === 0 ? (
                            <p className="mt-2 text-sm text-muted-foreground">No sites activated yet.</p>
                          ) : (
                            <ul className="mt-2 space-y-1.5">
                              {l.domains.map((d) => (
                                <li key={d.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-border">
                                  <a href={toHref(d.domain)} target="_blank" rel="noopener noreferrer" className="text-sm text-primary truncate hover:underline">
                                    {d.domain}
                                  </a>
                                  <button
                                    onClick={async () => {
                                      const ok = await confirm({
                                        title: "Deactivate this site?",
                                        description: (
                                          <>
                                            <span className="break-all font-medium text-foreground">{d.domain}</span> will be
                                            removed from this license, freeing a site slot. The plugin on that site will stop working.
                                          </>
                                        ),
                                        confirmLabel: "Deactivate",
                                        tone: "danger",
                                      });
                                      if (ok) deactivate.mutate({ licenseKey: l.licenseKey, domain: d.domain });
                                    }}
                                    disabled={deactivate.isPending}
                                    className="text-xs font-semibold text-muted-foreground hover:text-destructive inline-flex items-center gap-1 shrink-0 disabled:opacity-50 transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" /> Deactivate
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Subscription */}
                        {sub && (
                          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
                            <p className="text-sm text-muted-foreground">
                              Renews <span className="font-semibold text-foreground">{fmt(sub.currentPeriodEnd)}</span>
                            </p>
                            <button
                              onClick={async () => {
                                const ok = await confirm({
                                  title: "Cancel subscription?",
                                  description: (
                                    <>
                                      Your subscription <strong>won&apos;t renew</strong> — you won&apos;t be charged again.
                                      Your license <strong>stays active until {fmt(sub.currentPeriodEnd)}</strong>, then access ends.
                                    </>
                                  ),
                                  confirmLabel: "Cancel subscription",
                                  cancelLabel: "Keep subscription",
                                  tone: "danger",
                                });
                                if (ok) cancelSub.mutate(sub.paypalSubscriptionId);
                              }}
                              disabled={cancelSub.isPending}
                              className="btn-ruby text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-50 inline-flex items-center gap-1.5"
                            >
                              {cancelSub.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Cancel subscription
                            </button>
                          </div>
                        )}
                        {cancelledSub && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                              Subscription cancelled · won&apos;t renew · access until{" "}
                              <span className="font-semibold text-foreground">{fmt(cancelledSub.currentPeriodEnd)}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="card-surface p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
      <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary-soft text-primary-deep grid place-items-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-lg sm:text-xl font-bold leading-none">{value}</p>
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-tight">{label}</p>
      </div>
    </div>
  );
}
