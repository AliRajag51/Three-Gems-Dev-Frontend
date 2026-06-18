import type { DiscountSettings } from "@/lib/types/plugin";

const DAY_MS = 86_400_000;

export type TimedDiscountPlan = {
  discountPercent: number;
  discountDurationDays?: number | null;
  discountStartedAt?: string | null;
};

// When a plan's timed discount runs out (null = no expiry / never started).
export function planDiscountExpiresAt(plan: TimedDiscountPlan): Date | null {
  if (!plan.discountDurationDays || !plan.discountStartedAt) return null;
  return new Date(new Date(plan.discountStartedAt).getTime() + plan.discountDurationDays * DAY_MS);
}

// The plan discount actually in effect right now — 0 once its countdown elapses.
export function effectivePlanDiscount(plan: TimedDiscountPlan): number {
  const pct = plan.discountPercent ?? 0;
  if (pct <= 0) return 0;
  const expiresAt = planDiscountExpiresAt(plan);
  if (expiresAt && expiresAt.getTime() <= Date.now()) return 0;
  return pct;
}

// Display helper: whether the timed discount is live and how long is left.
export function planDiscountStatus(plan: TimedDiscountPlan) {
  const expiresAt = planDiscountExpiresAt(plan);
  const expired = !!expiresAt && expiresAt.getTime() <= Date.now();
  const msLeft = expiresAt ? expiresAt.getTime() - Date.now() : null;
  const daysLeft = msLeft != null ? Math.max(0, Math.ceil(msLeft / DAY_MS)) : null;
  return {
    expiresAt,
    expired,
    daysLeft,
    isTimed: !!expiresAt,
    active: (plan.discountPercent ?? 0) > 0 && !expired,
  };
}

export type DiscountDeadline = { daysLeft: number; source: "plan" | "global" };

// The deadline of the discount CURRENTLY shown for this plan — i.e. the one that,
// when it ends, will actually raise the price. Covers a plan's own timed discount
// AND a time-limited global sale. Returns null when the winning discount never
// expires (permanent plan discount / always-on global), nothing is discounted, or
// two sources tie (the price wouldn't move, so a countdown would be a fake deadline).
export function getActiveDiscountDeadline(
  plan: TimedDiscountPlan,
  settings: DiscountSettings | undefined | null,
  user: { createdAt?: string } | null | undefined,
): DiscountDeadline | null {
  const s = settings ?? { globalPercent: 0, globalEndsAt: null, newUserPercent: 0, newUserDays: 0 };

  const planPct = effectivePlanDiscount(plan);

  const globalActive = !s.globalEndsAt || new Date(s.globalEndsAt).getTime() > Date.now();
  const globalPct = globalActive ? s.globalPercent ?? 0 : 0;

  const isNewUser =
    !!user?.createdAt &&
    Date.now() - new Date(user.createdAt).getTime() < s.newUserDays * DAY_MS;
  const newUserPct = isNewUser ? s.newUserPercent ?? 0 : 0;

  const max = Math.max(planPct, globalPct, newUserPct);
  if (max <= 0) return null;

  const daysFrom = (ms: number) => Math.max(0, Math.ceil((ms - Date.now()) / DAY_MS));

  // The plan's own timer is the single biggest discount → its expiry is the deadline.
  if (planPct === max && planPct > Math.max(globalPct, newUserPct)) {
    const exp = planDiscountExpiresAt(plan);
    return exp ? { daysLeft: daysFrom(exp.getTime()), source: "plan" } : null;
  }

  // A time-limited global sale is the single biggest discount → its end date is the deadline.
  if (globalPct === max && globalPct > Math.max(planPct, newUserPct)) {
    if (!s.globalEndsAt) return null; // always-on global, never ends
    const exp = new Date(s.globalEndsAt).getTime();
    return exp > Date.now() ? { daysLeft: daysFrom(exp), source: "global" } : null;
  }

  // A tie, or a new-user discount (no fixed end date) is binding → no honest single deadline.
  return null;
}

export type PlanPricing = {
  percent: number;
  original: number;
  final: number;
  hasDiscount: boolean;
  isNewUser: boolean;
};

// Best-single-discount-wins: the largest of (plan, global, new-user-if-eligible).
// New-user eligibility is computed live from createdAt — no expiry job needed.
export function getPlanPricing(
  plan: { priceUsd: string; discountPercent: number; discountDurationDays?: number | null; discountStartedAt?: string | null },
  settings: DiscountSettings | undefined | null,
  user: { createdAt?: string } | null | undefined,
): PlanPricing {
  const s = settings ?? { globalPercent: 0, globalEndsAt: null, newUserPercent: 0, newUserDays: 0 };

  const isNewUser =
    !!user?.createdAt &&
    Date.now() - new Date(user.createdAt).getTime() < s.newUserDays * DAY_MS;

  // The global discount only counts while its campaign window is open (null = always on).
  const globalActive = !s.globalEndsAt || new Date(s.globalEndsAt).getTime() > Date.now();
  const effectiveGlobal = globalActive ? s.globalPercent ?? 0 : 0;

  const percent = Math.max(
    effectivePlanDiscount(plan),
    effectiveGlobal,
    isNewUser ? s.newUserPercent ?? 0 : 0,
  );

  const original = Number(plan.priceUsd);
  const final = +(original * (1 - percent / 100)).toFixed(2);

  return { percent, original, final, hasDiscount: percent > 0, isNewUser };
}
