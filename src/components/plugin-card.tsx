import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { Plugin } from "@/data/plugins";

export function PluginCard({ p }: { p: Plugin }) {
  return (
    <div className="card-surface p-6 flex flex-col group hover:-translate-y-1 hover:shadow-[0_20px_48px_-12px_rgba(201,58,74,0.18)] transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.iconColor} grid place-items-center text-2xl shadow-md`}>
          <span>{p.emoji}</span>
        </div>
        <span className="chip">{p.category}</span>
      </div>
      <h3 className="mt-5 font-display text-lg font-bold leading-tight">{p.name}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{p.description}</p>

      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 text-foreground font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {p.rating}
        </span>
        <span>·</span>
        <span>{p.reviews} reviews</span>
        <span>·</span>
        <span>v{p.version}</span>
      </div>

      <div className="mt-5 pt-5 border-t border-border flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground">From</p>
          <p className="font-display text-2xl font-bold">${p.price}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/plugins/$slug"
            params={{ slug: p.slug }}
            className="px-3.5 py-2 text-sm font-semibold rounded-lg border border-border hover:border-primary hover:text-primary transition-colors"
          >
            View
          </Link>
          <Link
            to="/checkout"
            search={{ plugin: p.slug }}
            className="btn-ruby px-3.5 py-2 text-sm font-semibold rounded-lg"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
}
