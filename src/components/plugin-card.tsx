import { Link } from "@tanstack/react-router";
import { Gem } from "lucide-react";
import type { PluginSummary } from "@/lib/api/types";

export function PluginCard({ p, priceFrom }: { p: PluginSummary; priceFrom?: number }) {
  return (
    <div className="card-surface p-6 flex flex-col group hover:-translate-y-1 hover:shadow-[0_20px_48px_-12px_rgba(201,58,74,0.18)] transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary grid place-items-center shadow-sm">
          <Gem className="w-6 h-6" />
        </div>
      </div>
      <h3 className="mt-5 font-display text-lg font-bold leading-tight">{p.name}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{p.tagline}</p>

      <div className="mt-5 pt-5 border-t border-border flex items-end justify-between">
        <div>
          {priceFrom !== undefined ? (
            <>
              <p className="text-xs text-muted-foreground">Starting at</p>
              <p className="font-display text-2xl font-bold">${priceFrom.toFixed(2)}</p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">See pricing options</p>
          )}
        </div>
        <Link
          to="/plugins/$slug"
          params={{ slug: p.slug }}
          className="px-3.5 py-2 text-sm font-semibold rounded-lg border border-border hover:border-primary hover:text-primary transition-colors"
        >
          View details →
        </Link>
      </div>
    </div>
  );
}
