"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { usePlugin } from "@/lib/hooks/plugin.hooks";
import { OrderSummary } from "./checkout-summary";
import { CheckoutForm } from "./checkout-form";

/**
 * Client-side checkout loader. We fetch the plugin in the BROWSER (not during SSR)
 * so the auth cookie is sent first-party via the /api/v1 rewrite — otherwise a
 * server fetch is unauthenticated and a PRIVATE plugin (visible only to allowed
 * users) would 404, showing "No plugin selected". Reuses the React Query cache
 * from the plugin detail page, so it's usually instant.
 */
export function CheckoutClient({ slug, planId }: { slug: string | null; planId: string | null }) {
  const { data: plugin, isLoading } = usePlugin(slug ?? "");
  const activePlan = plugin?.plans?.find((p) => p.id === planId) ?? plugin?.plans?.[0] ?? null;
  const ready = !!plugin && !!activePlan;

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="mb-6 lg:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Secure your license in under 60 seconds.
        </p>
      </div>

      {/* On mobile the summary comes FIRST (so the buyer sees what they're paying
          before the PayPal buttons); on desktop it sits in the right rail. */}
      <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
        <div className="order-2 lg:order-1 lg:col-span-3">
          <div>
            {isLoading ? (
              <div className="card-surface p-6 flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : ready ? (
              <CheckoutForm
                pluginId={plugin.id}
                pluginSlug={plugin.slug}
                plugin={plugin}
                plan={activePlan}
              />
            ) : (
              <div className="card-surface p-6">
                <p className="text-sm text-muted-foreground">No plan selected.</p>
                <Link href="/plugins" className="mt-4 block text-sm text-primary hover:underline">
                  ← Browse plugins
                </Link>
              </div>
            )}
          </div>
        </div>

        <aside className="order-1 lg:order-2 lg:col-span-2">
          {isLoading ? (
            <div className="card-surface p-6 lg:sticky lg:top-24 flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : ready ? (
            <OrderSummary plugin={plugin} plan={activePlan} />
          ) : (
            <div className="card-surface p-6 lg:sticky lg:top-24">
              <h3 className="font-display text-lg font-bold">Order summary</h3>
              <p className="mt-5 text-sm text-muted-foreground">No plugin selected.</p>
              <Link
                href="/plugins"
                className="mt-4 block text-center text-xs text-muted-foreground hover:text-primary"
              >
                ← Continue shopping
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
