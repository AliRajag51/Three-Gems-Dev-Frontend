import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Gem, Download, BookOpen, LifeBuoy, Check } from "lucide-react";
import { catalogApi } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import type { PluginPricingOptionPublic } from "@/lib/api/types";

const pluginQueryOptions = (slug: string) => ({
  queryKey: ["plugins", "detail", slug] as const,
  queryFn: () => catalogApi.getPlugin(slug),
});

export const Route = createFileRoute("/plugins/$slug")({
  loader: async ({ params, context: { queryClient } }) => {
    try {
      await queryClient.ensureQueryData(pluginQueryOptions(params.slug));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) throw notFound();
      throw err;
    }
  },
  head: () => ({
    meta: [{ title: "Plugin — Three Gems" }],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Plugin not found</h1>
      <p className="mt-3 text-muted-foreground">
        We couldn't find the plugin you were looking for.
      </p>
      <Link
        to="/plugins"
        className="btn-ruby inline-block mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold"
      >
        Back to plugins
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Couldn't load plugin</h1>
      <p className="mt-3 text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: PluginPage,
});

function PluginPage() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(pluginQueryOptions(slug));

  return (
    <div>
      <section className="hero-bg border-b border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 lg:py-16 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <Link to="/plugins" className="text-sm text-muted-foreground hover:text-primary">
              ← All plugins
            </Link>
            <div className="mt-4 flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-soft text-primary grid place-items-center shrink-0">
                <Gem className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                  {p.name}
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">{p.tagline}</p>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-foreground/90 leading-relaxed whitespace-pre-line">
              {p.description}
            </p>

            {p.latestVersion ? (
              <div className="mt-6 card-surface p-5 max-w-2xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-display font-bold">
                    Latest version v{p.latestVersion.version}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Released {new Date(p.latestVersion.releasedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {p.latestVersion.minWpVersion && (
                    <span>Requires WordPress {p.latestVersion.minWpVersion}+</span>
                  )}
                  {p.latestVersion.minPhpVersion && (
                    <span>Requires PHP {p.latestVersion.minPhpVersion}+</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">
                No release published yet — first version is on the way.
              </p>
            )}
          </div>

          <div className="space-y-4 h-fit lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-bold">Pricing</h2>
            {p.pricingOptions.length === 0 ? (
              <div className="card-surface p-6">
                <p className="text-sm text-muted-foreground">
                  Pricing isn't published yet. Check back soon or{" "}
                  <Link to="/contact" className="text-primary font-semibold">
                    contact us
                  </Link>
                  .
                </p>
              </div>
            ) : (
              [...p.pricingOptions]
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((opt) => <PricingOptionCard key={opt.id} opt={opt} />)
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function PricingOptionCard({ opt }: { opt: PluginPricingOptionPublic }) {
  const isSub = opt.paymentType === "SUBSCRIPTION";
  const intervalLabel = opt.billingInterval === "MONTH" ? "month" : "year";

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: opt.currency || "USD",
    }).format(cents / 100);

  const activationsLabel =
    opt.maxActivations === null
      ? "Unlimited sites"
      : opt.maxActivations === 1
        ? "1 site"
        : `Up to ${opt.maxActivations} sites`;

  const updatesLabel =
    opt.updateWindowDays >= 36500
      ? "Lifetime updates"
      : opt.updateWindowDays >= 365 && opt.updateWindowDays % 365 === 0
        ? `${opt.updateWindowDays / 365} year${opt.updateWindowDays === 365 ? "" : "s"} of updates`
        : `${opt.updateWindowDays} days of updates`;

  return (
    <div className="card-surface p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-bold">{opt.label}</h3>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {isSub ? "Subscription" : "One-time"}
        </span>
      </div>

      <div className="mt-4">
        {opt.introPriceCents !== null && opt.introPriceCents !== opt.priceCents ? (
          <div>
            <p className="font-display text-3xl font-extrabold">
              {formatPrice(opt.introPriceCents)}
              {isSub && (
                <span className="text-sm font-medium text-muted-foreground">
                  {" "}
                  first {intervalLabel}
                </span>
              )}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              then {formatPrice(opt.priceCents)}
              {isSub ? ` / ${intervalLabel}` : ""}
            </p>
          </div>
        ) : (
          <p className="font-display text-3xl font-extrabold">
            {formatPrice(opt.priceCents)}
            {isSub && (
              <span className="text-sm font-medium text-muted-foreground"> / {intervalLabel}</span>
            )}
          </p>
        )}
      </div>

      <ul className="mt-5 space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-primary shrink-0" />
          {activationsLabel}
        </li>
        <li className="flex items-center gap-2">
          <Download className="w-4 h-4 text-primary shrink-0" />
          {updatesLabel}
        </li>
        <li className="flex items-center gap-2">
          <LifeBuoy className="w-4 h-4 text-primary shrink-0" />
          Email support
        </li>
        <li className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary shrink-0" />
          Documentation access
        </li>
      </ul>

      <a
        href={`/checkout?pricingOptionId=${encodeURIComponent(opt.id)}`}
        className="btn-ruby mt-6 w-full block text-center px-5 py-3 rounded-xl text-sm font-semibold"
      >
        Buy this license
      </a>
    </div>
  );
}
