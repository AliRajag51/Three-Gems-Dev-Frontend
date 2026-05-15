/**
 * Checkout confirmation page.
 *
 * This is NOT a card-details form — card collection happens on Stripe's hosted
 * Checkout page. Here we:
 *   1. Confirm the customer is signed in (RequireAuth)
 *   2. Show an order summary for the pricing option they picked
 *   3. On "Confirm & Pay", create a Stripe Checkout Session via the backend
 *      and full-page-redirect to Stripe's URL
 *
 * The pricing-option-id is the only thing in the URL. To render the plugin
 * name + price we need to know which plugin owns the pricing option. The
 * backend doesn't expose a "lookup pricing option by id" endpoint today, so
 * we list plugins and fetch each detail until we find a match. The catalog is
 * tiny (a handful of plugins) so the cost is fine, and TanStack Query caches
 * each detail for /plugins/:slug reuse.
 */
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Loader2, Lock, ShieldCheck, Check, AlertCircle } from "lucide-react";
import { catalogApi } from "@/lib/api/catalog";
import { billingApi } from "@/lib/api/billing";
import { ApiError } from "@/lib/api/client";
import { RequireAuth } from "@/components/require-auth";
import { useSession } from "@/hooks/use-session";
import type { PluginDetail, PluginPricingOptionPublic } from "@/lib/api/types";

type Search = { pricingOptionId?: string; pluginSlug?: string };

const pricingLookupQueryOptions = (pricingOptionId: string, pluginSlug?: string) => ({
  queryKey: ["checkout", "pricing-lookup", pricingOptionId, pluginSlug ?? null] as const,
  queryFn: async (): Promise<{
    plugin: PluginDetail;
    option: PluginPricingOptionPublic;
  } | null> => {
    // Fast path: caller supplied the plugin slug.
    if (pluginSlug) {
      const plugin = await catalogApi.getPlugin(pluginSlug);
      const option = plugin.pricingOptions.find((o) => o.id === pricingOptionId);
      if (option) return { plugin, option };
    }
    // Fallback: scan the (small) plugin catalog.
    const list = await catalogApi.listPlugins({ limit: 100 });
    for (const summary of list.items) {
      try {
        const detail = await catalogApi.getPlugin(summary.slug);
        const option = detail.pricingOptions.find((o) => o.id === pricingOptionId);
        if (option) return { plugin: detail, option };
      } catch {
        // Ignore individual plugin failures and keep scanning.
      }
    }
    return null;
  },
});

export const Route = createFileRoute("/checkout")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    pricingOptionId: typeof s.pricingOptionId === "string" ? s.pricingOptionId : undefined,
    pluginSlug: typeof s.pluginSlug === "string" ? s.pluginSlug : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Checkout — Three Gems" },
      { name: "description", content: "Complete your Three Gems plugin purchase securely." },
    ],
  }),
  component: CheckoutRoute,
});

function CheckoutRoute() {
  const { pricingOptionId, pluginSlug } = Route.useSearch();

  if (!pricingOptionId) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Pick a license first</h1>
        <p className="mt-3 text-muted-foreground">
          We couldn't read the pricing option from the URL. Choose a plan from the plugin page.
        </p>
        <Link
          to="/plugins"
          className="btn-ruby inline-block mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold"
        >
          Browse plugins
        </Link>
      </div>
    );
  }

  return (
    <RequireAuth>
      <CheckoutPage pricingOptionId={pricingOptionId} pluginSlug={pluginSlug} />
    </RequireAuth>
  );
}

function CheckoutPage({
  pricingOptionId,
  pluginSlug,
}: {
  pricingOptionId: string;
  pluginSlug: string | undefined;
}) {
  const { user } = useSession();
  const { data } = useSuspenseQuery(pricingLookupQueryOptions(pricingOptionId, pluginSlug));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      billingApi.createCheckoutSession({
        pricingOptionId,
        provider: "stripe",
        successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/checkout/cancel?pricingOptionId=${encodeURIComponent(
          pricingOptionId,
        )}`,
      }),
    onSuccess: (response) => {
      window.location.assign(response.url);
    },
    onError: (err) => {
      setErrorMessage(
        err instanceof ApiError
          ? (err.problem.detail ?? err.message)
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      );
    },
  });

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Pricing option unavailable</h1>
        <p className="mt-3 text-muted-foreground">
          The plan you selected isn't available anymore. Pick another one from the plugin page.
        </p>
        <Link
          to="/plugins"
          className="btn-ruby inline-block mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold"
        >
          Browse plugins
        </Link>
      </div>
    );
  }

  const { plugin, option } = data;
  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 lg:py-16">
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <h1 className="font-display text-3xl font-bold">Checkout</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You'll complete payment on Stripe's secure checkout page.
          </p>

          <div className="mt-8 space-y-6">
            <div className="card-surface p-6">
              <h3 className="font-display text-lg font-bold">Account</h3>
              <div className="mt-4 text-sm">
                <p className="text-muted-foreground">Signed in as</p>
                <p className="mt-1 font-semibold">{user?.email}</p>
              </div>
            </div>

            <div className="card-surface p-6">
              <h3 className="font-display text-lg font-bold">Payment</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Click below to be redirected to Stripe's hosted checkout. We never see or store your
                card details.
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> SSL encrypted
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> PCI-DSS compliant
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary" /> 30-day refund
                </span>
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                mutation.mutate();
              }}
              disabled={mutation.isPending}
              className="btn-ruby w-full px-5 py-3.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Stripe…
                </>
              ) : (
                <>Confirm & Pay</>
              )}
            </button>
          </div>
        </div>

        <aside className="lg:col-span-2">
          <OrderSummary plugin={plugin} option={option} />
        </aside>
      </div>
    </div>
  );
}

function OrderSummary({
  plugin,
  option,
}: {
  plugin: PluginDetail;
  option: PluginPricingOptionPublic;
}) {
  const isSub = option.paymentType === "SUBSCRIPTION";
  const intervalLabel = option.billingInterval === "MONTH" ? "month" : "year";

  const formatPrice = useMemo(
    () => (cents: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: option.currency || "USD",
      }).format(cents / 100),
    [option.currency],
  );

  const hasIntro = option.introPriceCents !== null && option.introPriceCents !== option.priceCents;

  return (
    <div className="card-surface p-6 lg:sticky lg:top-24">
      <h3 className="font-display text-lg font-bold">Order summary</h3>
      <div className="mt-5 pb-5 border-b border-border">
        <p className="font-semibold">{plugin.name}</p>
        <p className="text-xs text-muted-foreground mt-1">{option.label}</p>
      </div>

      <dl className="mt-5 space-y-2.5 text-sm">
        {hasIntro && option.introPriceCents !== null ? (
          <>
            <Row
              dt={`First ${isSub ? intervalLabel : "payment"}`}
              dd={formatPrice(option.introPriceCents)}
            />
            <Row
              dt={isSub ? `Then per ${intervalLabel}` : "Regular price"}
              dd={formatPrice(option.priceCents)}
            />
          </>
        ) : (
          <Row dt={isSub ? `Per ${intervalLabel}` : "Price"} dd={formatPrice(option.priceCents)} />
        )}
        <div className="border-t border-border pt-3 flex justify-between">
          <dt className="font-display font-bold">Due today</dt>
          <dd className="font-display text-xl font-bold">
            {formatPrice(
              hasIntro && option.introPriceCents !== null
                ? option.introPriceCents
                : option.priceCents,
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-6 space-y-2 text-sm">
        {[
          option.maxActivations === null
            ? "Unlimited site activations"
            : option.maxActivations === 1
              ? "1 site activation"
              : `Up to ${option.maxActivations} site activations`,
          option.updateWindowDays >= 36500
            ? "Lifetime updates"
            : `${Math.round(option.updateWindowDays / 365)} year${option.updateWindowDays === 365 ? "" : "s"} of updates`,
          "Instant license delivery",
        ].map((t) => (
          <p key={t} className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" /> {t}
          </p>
        ))}
      </div>

      <p className="mt-5 text-xs text-muted-foreground inline-flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Secure checkout · GDPR compliant
      </p>
      <Link
        to="/plugins"
        className="mt-4 block text-center text-xs text-muted-foreground hover:text-primary"
      >
        ← Continue shopping
      </Link>
    </div>
  );
}

function Row({ dt, dd }: { dt: string; dd: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{dt}</dt>
      <dd className="font-semibold">{dd}</dd>
    </div>
  );
}
