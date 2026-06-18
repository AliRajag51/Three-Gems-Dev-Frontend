"use client";

import Link from "next/link";
import { Gem, CheckCheck, Flame } from "lucide-react";
import type { PluginListItem } from "@/lib/types/plugin";
import { useAuth } from "@/lib/context/auth.context";
import { getPlanPricing } from "@/lib/pricing";
import { DiscountCountdown } from "@/components/discount-countdown";

export function PluginCard({
  p,
  purchased = false,
  badge,
}: {
  p: PluginListItem;
  purchased?: boolean;
  badge?: string;
}) {
  const { user } = useAuth();

  // Compute the cheapest plan's real price for this viewer (best-wins:
  // per-plan / global / new-user). Mirrors the detail page exactly.
  let best: ReturnType<typeof getPlanPricing> | null = null;
  let bestPlan: PluginListItem["plans"][number] | null = null;
  for (const plan of p.plans) {
    const pricing = getPlanPricing(plan, p.discountSettings, user);
    if (!best || pricing.final < best.final) {
      best = pricing;
      bestPlan = plan;
    }
  }

  return (
    <div className="card-surface relative overflow-hidden p-6 flex flex-col group hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_48px_-16px_rgba(201,58,74,0.22)] transition-all duration-300">
      {/* Hover glow accent */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-start justify-between">
        {p.iconUrl ? (
          <img
            src={p.iconUrl}
            alt={p.name}
            className="w-12 h-12 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-primary-deep grid place-items-center shadow-md group-hover:scale-105 transition-transform">
            <Gem className="w-6 h-6 text-white" />
          </div>
        )}
        <div className="flex flex-col items-end gap-1.5">
          {badge && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700">
              <Flame className="w-3 h-3" /> {badge}
            </span>
          )}
          {purchased ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700">
              <CheckCheck className="w-3 h-3" /> Owned
            </span>
          ) : best?.hasDiscount ? (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              −{best.percent}%
            </span>
          ) : null}
        </div>
      </div>

      <h3 className="relative mt-5 font-display text-lg font-bold leading-tight group-hover:text-primary transition-colors">{p.name}</h3>
      {/* min-h reserves 2 lines so cards stay aligned even when a description is missing */}
      <p className="relative mt-1.5 text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{p.description}</p>

      <div className="relative mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span>v{p.version}</span>
        {p.planCount > 0 && (
          <>
            <span>·</span>
            <span>{p.planCount} {p.planCount === 1 ? "plan" : "plans"}</span>
          </>
        )}
      </div>

      <div className="relative mt-5 pt-5 border-t border-border flex items-end justify-between">
        <div>
          {purchased ? (
            <div className="inline-flex items-center gap-1.5 text-emerald-700">
              <CheckCheck className="w-5 h-5" />
              <span className="font-display text-lg font-bold">Purchased</span>
            </div>
          ) : best ? (
            <>
              <p className="text-xs text-muted-foreground">From</p>
              <div className="flex items-baseline gap-2">
                <p className="font-display text-2xl font-bold">${best.final}</p>
                {best.hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">${best.original}</span>
                )}
              </div>
              {bestPlan && (
                <DiscountCountdown
                  plan={bestPlan}
                  settings={p.discountSettings}
                  user={user}
                  className="mt-2"
                />
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No plans yet</p>
          )}
        </div>
        <Link
          href={`/plugins/${p.slug}`}
          className="btn-ruby px-3.5 py-2 text-sm font-semibold rounded-lg"
        >
          {purchased ? "Manage" : "View"}
        </Link>
      </div>
    </div>
  );
}
