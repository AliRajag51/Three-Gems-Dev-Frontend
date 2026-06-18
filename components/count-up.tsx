"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

// Animates a number from 0 to `value` once it scrolls into view (easeOutCubic).
// Keeps an optional prefix/suffix and thousands separators, e.g. "<", "6", "h" -> "<6h".
// Respects prefers-reduced-motion (shows the final value immediately).
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1600,
  className,
  style,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done.current) return;
        done.current = true;
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
          setDisplay(value * eased);
          if (t < 1) requestAnimationFrame(step);
          else setDisplay(value);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  const formatted = display.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
