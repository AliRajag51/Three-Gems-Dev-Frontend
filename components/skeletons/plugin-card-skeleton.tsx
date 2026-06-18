/**
 * Loading skeleton for a plugin card + a grid helper. Mirrors the real
 * PluginCard layout (icon, badge, title, description, meta, price/CTA footer)
 * so grids don't jump when data arrives. Responsive via the same grid classes.
 */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted-foreground/20 ${className}`} />;
}

export function PluginCardSkeleton() {
  return (
    <div className="card-surface p-6 flex flex-col">
      {/* header: icon + badge */}
      <div className="flex items-start justify-between">
        <Bar className="w-12 h-12 rounded-xl" />
        <Bar className="h-5 w-16 rounded-full" />
      </div>

      {/* title + description */}
      <Bar className="mt-5 h-5 w-2/3" />
      <Bar className="mt-2.5 h-3.5 w-full" />
      <Bar className="mt-1.5 h-3.5 w-4/5" />

      {/* meta */}
      <Bar className="mt-4 h-3 w-24" />

      {/* footer: price + CTA */}
      <div className="mt-5 pt-5 border-t border-border flex items-end justify-between">
        <div>
          <Bar className="h-3 w-10" />
          <Bar className="mt-2 h-7 w-20" />
        </div>
        <Bar className="h-9 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function PluginGridSkeleton({
  count = 6,
  className = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <PluginCardSkeleton key={i} />
      ))}
    </div>
  );
}
