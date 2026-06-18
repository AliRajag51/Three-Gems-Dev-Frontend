/**
 * Loading skeleton for the plugin detail page. Mirrors the real two-column
 * layout (content + sticky price card) so the page doesn't visually jump when
 * data arrives. Fully responsive — stacks on mobile, splits on lg+ — exactly
 * like the live page.
 */

function Bar({ className = "" }: { className?: string }) {
  // muted-foreground at low opacity gives a clearly visible grey on both the
  // white cards and the page background (and adapts in dark mode).
  return <div className={`animate-pulse rounded-md bg-muted-foreground/20 ${className}`} />;
}

export function PluginDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-10 pb-28 lg:pb-10 lg:grid lg:grid-cols-3 lg:gap-10 lg:items-start">
      {/* ── Left column: header + tabs + content ── */}
      <div className="lg:col-span-2">
        {/* back link */}
        <Bar className="h-4 w-24" />

        {/* plugin header */}
        <div className="mt-5 flex items-start gap-4">
          <Bar className="w-16 h-16 rounded-2xl shrink-0" />
          <div className="flex-1 min-w-0">
            <Bar className="h-8 w-2/3 max-w-sm" />
            <Bar className="mt-3 h-4 w-1/2 max-w-xs" />
            <div className="mt-4 flex flex-wrap gap-3">
              <Bar className="h-3 w-14" />
              <Bar className="h-3 w-28" />
              <Bar className="h-3 w-24" />
            </div>
          </div>
        </div>

        {/* tab bar */}
        <div className="mt-8 flex gap-5 border-b border-border pb-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Bar key={i} className="h-4 w-20 shrink-0" />
          ))}
        </div>

        {/* tab content */}
        <div className="py-8 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bar key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>

      {/* ── Right column: price card ── */}
      <div className="mt-8 lg:mt-0">
        <div className="card-surface p-6">
          {/* price */}
          <Bar className="h-3 w-16" />
          <Bar className="mt-2 h-9 w-36" />
          <Bar className="mt-2 h-4 w-28" />

          {/* license / plan options */}
          <div className="mt-5 space-y-2">
            <Bar className="h-3 w-20" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Bar key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>

          {/* CTA */}
          <Bar className="mt-5 h-12 w-full rounded-xl" />

          {/* perks list */}
          <div className="mt-5 pt-5 border-t border-border space-y-3">
            <Bar className="h-4 w-40" />
            <Bar className="h-4 w-44" />
            <Bar className="h-4 w-36" />
            <Bar className="h-4 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
