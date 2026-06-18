"use client";

import { Clock } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { getActiveDiscountDeadline, type TimedDiscountPlan } from "@/lib/pricing";
import type { DiscountSettings } from "@/lib/types/plugin";

// Urgency tiers for the countdown pill: the closer the deadline, the hotter the
// colour and the faster it pulses — calm green when far off, amber mid-range, and
// an urgent red flash in the final days. Drives scarcity/FOMO.
function countdownTier(daysLeft: number) {
  if (daysLeft <= 3) {
    return {
      gradient: "linear-gradient(110deg,#ef4444 0%,#fb7185 35%,#ec4899 62%,#ef4444 100%)",
      glow: "236,72,153", flow: 2.2, glowDur: 1.1, tick: 0.85,
    };
  }
  if (daysLeft <= 10) {
    return {
      gradient: "linear-gradient(110deg,#f59e0b 0%,#fb923c 42%,#f97316 76%,#f59e0b 100%)",
      glow: "249,115,22", flow: 3.0, glowDur: 1.9, tick: 1.4,
    };
  }
  return {
    gradient: "linear-gradient(110deg,#0ea5a4 0%,#10b981 42%,#34d399 76%,#0ea5a4 100%)",
    glow: "16,185,129", flow: 4.0, glowDur: 2.8, tick: 1.8,
  };
}

// Eye-catching "X days left" pill for the discount currently shown on a plan — its own
// timed discount OR a time-limited global sale, whichever is actually ending. Renders
// nothing when the winning discount never expires or the price wouldn't change at the
// deadline (handled inside getActiveDiscountDeadline). All styling/animation is inline
// via Framer Motion; colour + pulse speed escalate with urgency (see countdownTier).
export function DiscountCountdown({
  plan, settings, user, className = "",
}: {
  plan: TimedDiscountPlan;
  settings: DiscountSettings;
  user: { createdAt?: string } | null | undefined;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const deadline = getActiveDiscountDeadline(plan, settings, user);
  if (!deadline) return null;

  const label = deadline.daysLeft === 1 ? "1 day left" : `${deadline.daysLeft} days left`;
  const t = countdownTier(deadline.daysLeft);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={
        reduce
          ? { opacity: 1, scale: 1 }
          : {
              opacity: 1,
              scale: 1,
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              boxShadow: [
                `0 0 0 0 rgba(${t.glow},0)`,
                `0 6px 22px -2px rgba(${t.glow},0.85)`,
                `0 0 0 0 rgba(${t.glow},0)`,
              ],
            }
      }
      transition={{
        opacity: { duration: 0.3 },
        scale: { duration: 0.3, ease: "backOut" },
        backgroundPosition: { duration: t.flow, repeat: Infinity, ease: "easeInOut" },
        boxShadow: { duration: t.glowDur, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={reduce ? undefined : { scale: 1.06 }}
      style={{
        backgroundImage: t.gradient,
        backgroundSize: "220% 100%",
        textShadow: "0 1px 1px rgba(0,0,0,0.18)",
      }}
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white ${className}`}
    >
      <motion.span
        className="inline-flex"
        animate={reduce ? undefined : { scale: [1, 1.25, 1], rotate: [0, 12, 0] }}
        transition={{ duration: t.tick, repeat: Infinity, ease: "easeInOut" }}
      >
        <Clock className="h-3 w-3" />
      </motion.span>
      {label}
    </motion.span>
  );
}
