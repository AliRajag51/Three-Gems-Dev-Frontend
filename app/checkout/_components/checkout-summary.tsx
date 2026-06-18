"use client";

import { ShieldCheck, Check, Gem } from "lucide-react";
import { useAuth } from "@/lib/context/auth.context";
import { getPlanPricing } from "@/lib/pricing";
import type { Plan, DiscountSettings } from "@/lib/types/plugin";

import Link from "next/link";

type PluginLite = {
  name: string;
  iconUrl: string | null;
  discountSettings: DiscountSettings;
};

const siteLabel = (n: number) =>
  n === 0 ? "Unlimited sites" : n === 1 ? "Single site" : `${n} sites`;

const durationLabel = (d: number) => {
  if (d === 0) return "Lifetime";
  if (d === 30) return "1 month";
  if (d === 60) return "2 months";
  if (d === 90) return "3 months";
  if (d === 180) return "6 months";
  if (d === 365) return "1 year";
  if (d === 730) return "2 years";
  return `${d} days`;
};

// Short price suffix for recurring plans (e.g. "/month") — empty for one-time.
const intervalSuffix = (plan: Plan) => {
  if (plan.billingType !== "RECURRING" || !plan.billingIntervalUnit) return "";
  const unit = plan.billingIntervalUnit.toLowerCase();
  const count = plan.billingIntervalCount ?? 1;
  return count === 1 ? `/${unit}` : `/${count} ${unit}s`;
};

// Accurate billing line: recurring plans show their cadence ("Billed monthly");
// one-time plans show how long updates & support last.
const billingPeriodLabel = (plan: Plan) => {
  if (plan.billingType === "RECURRING" && plan.billingIntervalUnit) {
    const unit = plan.billingIntervalUnit.toLowerCase();
    const count = plan.billingIntervalCount ?? 1;
    const adverb: Record<string, string> = { day: "daily", week: "weekly", month: "monthly", year: "yearly" };
    return count === 1 ? `Billed ${adverb[unit] ?? `every ${unit}`}` : `Billed every ${count} ${unit}s`;
  }
  return `${durationLabel(plan.durationDays)} of updates & support`;
};

export function OrderSummary({ plugin, plan }: { plugin: PluginLite; plan: Plan }) {
  const { user } = useAuth();
  const pricing = getPlanPricing(plan, plugin.discountSettings, user);
  const saved = +(pricing.original - pricing.final).toFixed(2);

  return (
    <div className="card-surface p-5 sm:p-6 lg:sticky lg:top-24">
      <h3 className="font-display text-lg font-bold">Order summary</h3>

      <div className="mt-5 flex items-start gap-3 pb-5 border-b border-border">
        {plugin.iconUrl ? (
          <img src={plugin.iconUrl} alt={plugin.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-primary-deep grid place-items-center shrink-0">
            <Gem className="w-6 h-6 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{plugin.name}</p>
          <p className="text-xs font-semibold text-foreground/80 truncate">{plan.name}</p>
          <p className="text-xs text-muted-foreground">
            {`${siteLabel(plan.siteLimit)} · ${billingPeriodLabel(plan)}`}
          </p>
        </div>
        <p className="font-display font-bold shrink-0">
          ${pricing.final.toFixed(2)}
          {intervalSuffix(plan) && (
            <span className="text-xs font-normal text-muted-foreground">{intervalSuffix(plan)}</span>
          )}
        </p>
      </div>

      <dl className="mt-5 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-semibold">${pricing.original.toFixed(2)}</dd>
        </div>
        {pricing.hasDiscount && (
          <div className="flex justify-between text-primary">
            <dt>
              Discount <span className="font-semibold">−{pricing.percent}%</span>
            </dt>
            <dd className="font-semibold">−${saved.toFixed(2)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tax</dt>
          <dd className="font-semibold">$0</dd>
        </div>
        <div className="border-t border-border pt-3 flex justify-between items-baseline">
          <dt className="font-display font-bold">Total</dt>
          <dd className="font-display text-xl font-bold">
            ${pricing.final.toFixed(2)}
            {intervalSuffix(plan) && (
              <span className="text-sm font-medium text-muted-foreground">{intervalSuffix(plan)}</span>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-6 space-y-2 text-sm">
        {["Updates while your license is active", "Instant download access", "Renews at the same price"].map((t) => (
          <p key={t} className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" /> {t}
          </p>
        ))}
      </div>

      <p className="mt-5 text-xs text-muted-foreground inline-flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Secure checkout · GDPR compliant
      </p>
      <Link href="/plugins" className="mt-4 block text-center text-xs text-muted-foreground hover:text-primary">
        ← Continue shopping
      </Link>
    </div>
  );
}

