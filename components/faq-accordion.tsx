"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Single-open FAQ accordion: exactly one item is open at all times (starts on
 * the first). Opening another closes the current one; clicking the already-open
 * one keeps it open, so the panel never collapses to nothing.
 */
export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-expanded={isOpen}
              className="w-full flex cursor-pointer items-center justify-between gap-4 p-5 text-left font-semibold"
            >
              {f.q}
              <ChevronDown
                className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                }`}
              />
            </button>
            {/* grid-rows trick gives a smooth height animation without measuring */}
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
