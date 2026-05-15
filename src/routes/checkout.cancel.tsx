/**
 * /checkout/cancel — Stripe redirects here if the customer abandons the
 * hosted Checkout page (back button, closes the tab, etc.). Pure landing
 * page; no backend call. If we know the pricingOptionId from the cancel_url
 * query, we offer a one-click retry back to /checkout.
 */
import { createFileRoute, Link } from "@tanstack/react-router";

type Search = { pricingOptionId?: string };

export const Route = createFileRoute("/checkout/cancel")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    pricingOptionId: typeof s.pricingOptionId === "string" ? s.pricingOptionId : undefined,
  }),
  head: () => ({
    meta: [{ title: "Checkout cancelled — Three Gems" }],
  }),
  component: CheckoutCancelPage,
});

function CheckoutCancelPage() {
  const { pricingOptionId } = Route.useSearch();
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <p className="font-display text-6xl">🛒</p>
      <h1 className="mt-4 font-display text-3xl font-bold">Checkout cancelled</h1>
      <p className="mt-3 text-muted-foreground">
        Looks like you didn't complete the purchase. No payment was taken — your card hasn't been
        charged.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {pricingOptionId ? (
          <Link
            to="/checkout"
            search={{ pricingOptionId }}
            className="btn-ruby inline-block px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            Try again
          </Link>
        ) : (
          <Link
            to="/plugins"
            className="btn-ruby inline-block px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            Browse plugins
          </Link>
        )}
        <Link
          to="/plugins"
          className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:border-primary"
        >
          Back to plugins
        </Link>
      </div>
    </div>
  );
}
