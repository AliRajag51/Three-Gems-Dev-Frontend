"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, PackageSearch, ShieldCheck, RefreshCw, BadgeCheck, ArrowUpDown, X, TrendingUp } from "lucide-react";
import { usePlugins } from "@/lib/hooks/plugin.hooks";
import { PluginGridSkeleton } from "@/components/skeletons/plugin-card-skeleton";
import { useMyLicenses } from "@/lib/hooks/license.hooks";
import { useAuth } from "@/lib/context/auth.context";
import { getPlanPricing } from "@/lib/pricing";
import { PluginCard } from "@/components/plugin-card";
import type { PluginListItem } from "@/lib/types/plugin";

type Sort = "popular" | "newest" | "price-asc" | "price-desc" | "name";

const SORTS: { value: Sort; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name (A–Z)" },
];

const trust = [
  { icon: ShieldCheck, text: "Secure checkout" },
  { icon: BadgeCheck, text: "30-day money-back" },
  { icon: RefreshCw, text: "1 year of updates" },
];

export default function PluginsPage() {
  const { user } = useAuth();
  const { data: plugins, isLoading, isError } = usePlugins();
  const { data: licenses } = useMyLicenses(!!user);
  const [q, setQ] = useState("");
  const [purchasedOnly, setPurchasedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("popular");

  const purchasedIds = useMemo(() => {
    const now = Date.now();
    return new Set(
      (licenses ?? [])
        .filter((l) => l.status === "ACTIVE" && (!l.expiresAt || new Date(l.expiresAt).getTime() > now))
        .map((l) => l.plugin.id),
    );
  }, [licenses]);

  // Top-selling plugins (by owners) — shown in their own highlight section.
  const topSellers = useMemo(
    () => [...(plugins ?? [])].filter((p) => p.sales > 0).sort((a, b) => b.sales - a.sales).slice(0, 3),
    [plugins],
  );

  // Cheapest real (best-wins) price for a plugin — used for price sorting.
  const priceOf = (p: PluginListItem) => {
    let best = Infinity;
    for (const plan of p.plans) {
      const final = getPlanPricing(plan, p.discountSettings, user).final;
      if (final < best) best = final;
    }
    return best === Infinity ? 0 : best;
  };

  const filtered = (plugins ?? []).filter((p) => {
    const matchesSearch =
      q === "" ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(q.toLowerCase());
    const matchesPurchased = !purchasedOnly || purchasedIds.has(p.id);
    return matchesSearch && matchesPurchased;
  });

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      switch (sort) {
        case "popular": return b.sales - a.sales;
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "price-asc": return priceOf(a) - priceOf(b);
        case "price-desc": return priceOf(b) - priceOf(a);
        case "name": return a.name.localeCompare(b.name);
      }
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sort, user]);

  const pillClass = (active: boolean) =>
    `px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
      active ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:border-primary/40"
    }`;

  const total = plugins?.length ?? 0;

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero-bg relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-50 [mask-image:radial-gradient(70%_60%_at_30%_0%,black,transparent)]" />
        <div className="pointer-events-none hidden sm:block absolute -top-24 right-0 w-[30rem] h-[30rem] rounded-full bg-primary/10 blur-3xl animate-float-slow" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 py-16 lg:py-20">
          <span className="chip">Plugin Catalog</span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">All Plugins</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Premium WordPress &amp; WooCommerce plugins, crafted with care by Three Gems.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {trust.map((t) => (
              <span
                key={t.text}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface/70 backdrop-blur text-sm font-medium text-muted-foreground"
              >
                <t.icon className="w-4 h-4 text-primary" /> {t.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Sellers (a static highlight — never affected by search/filter/sort) ── */}
      {!isLoading && !isError && topSellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 lg:px-8 pt-12">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 grid place-items-center">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight">Top Sellers</h2>
              <p className="text-sm text-muted-foreground">The plugins merchants buy most.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topSellers.map((p) => (
              <PluginCard key={`top-${p.slug}`} p={p} purchased={purchasedIds.has(p.id)} badge="Top seller" />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-10">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="w-9 h-9 rounded-xl bg-primary-soft text-primary grid place-items-center">
            <PackageSearch className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">All plugins</h2>
            <p className="text-sm text-muted-foreground">Browse the full catalog.</p>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          {user && (
            <div className="flex gap-2">
              <button onClick={() => setPurchasedOnly(false)} className={pillClass(!purchasedOnly)}>All plugins</button>
              <button onClick={() => setPurchasedOnly(true)} className={pillClass(purchasedOnly)}>Purchased</button>
            </div>
          )}

          <div className="flex flex-1 gap-3 lg:justify-end">
            {/* Search */}
            <div className="relative flex-1 lg:flex-none lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search plugins..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
              />
              {q && (
                <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear search">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-border bg-surface text-sm font-medium focus:outline-none focus:border-primary cursor-pointer"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Result count ── */}
        {!isLoading && !isError && (
          <p className="mt-5 text-sm text-muted-foreground">
            {sorted.length === total
              ? `${total} plugin${total !== 1 ? "s" : ""}`
              : `${sorted.length} of ${total} plugin${total !== 1 ? "s" : ""}`}
            {q && <> for &ldquo;<span className="text-foreground font-medium">{q}</span>&rdquo;</>}
          </p>
        )}

        {isLoading && (
          <PluginGridSkeleton count={6} className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" />
        )}

        {isError && (
          <p className="text-center py-20 text-muted-foreground">Failed to load plugins. Please try again.</p>
        )}

        {!isLoading && !isError && (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((p) => (
                <PluginCard key={p.slug} p={p} purchased={purchasedIds.has(p.id)} />
              ))}
            </div>

            {sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted grid place-items-center">
                  <PackageSearch className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm font-semibold">
                  {total === 0
                    ? "No plugins available yet"
                    : purchasedOnly
                    ? "You haven't purchased any plugins yet"
                    : "No plugins match your search"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {total === 0
                    ? "Check back soon — new plugins are on the way."
                    : purchasedOnly
                    ? "Browse the catalog to find your first plugin."
                    : "Try a different keyword or clear the filters."}
                </p>
                {(q || purchasedOnly) && total > 0 && (
                  <button
                    onClick={() => { setQ(""); setPurchasedOnly(false); }}
                    className="btn-ruby mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Bottom CTA ── */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 pb-16">
        <div className="card-surface p-8 lg:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h3 className="font-display text-xl font-bold">Can&apos;t find what you need?</h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-lg">
              Tell us what your store is missing — we build plugins based on real merchant requests.
            </p>
          </div>
          <Link href="/contact" className="btn-ruby px-6 py-3 rounded-xl text-sm font-semibold shrink-0">
            Request a plugin
          </Link>
        </div>
      </section>
    </div>
  );
}
