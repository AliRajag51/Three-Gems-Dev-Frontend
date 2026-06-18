"use client";

import { useState, useRef, useEffect, useMemo, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/context/auth.context";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useMySubscriptions } from "@/lib/hooks/subscription.hooks";
import { useMyLicenses } from "@/lib/hooks/license.hooks";
import { getPlanPricing } from "@/lib/pricing";
import { createOrderService, captureOrderService } from "@/lib/services/payment.service";
import {
  createSubscriptionService,
  cancelSubscriptionService,
  getSubscriptionStatusService,
} from "@/lib/services/subscription.service";
import type { Plan, DiscountSettings } from "@/lib/types/plugin";
import { getCountryOptions } from "@/lib/countries";

type Props = {
  pluginId: string;
  pluginSlug: string;
  plugin: { name: string; iconUrl: string | null; discountSettings: DiscountSettings };
  plan: Plan;
};

type ButtonsProps = {
  pluginId: string;
  pluginSlug: string;
  planId: string;
  isRecurring: boolean;
  country: string;
};

function billingLabel(plan: Plan): string {
  if (plan.billingType !== "RECURRING" || !plan.billingIntervalUnit) return "";
  const unit = plan.billingIntervalUnit.toLowerCase();
  const count = plan.billingIntervalCount ?? 1;
  return count === 1 ? `/ ${unit}` : `/ ${count} ${unit}s`;
}

function PayPalSection({ pluginId, pluginSlug, planId, isRecurring, country }: ButtonsProps) {
  const router = useRouter();
  const [{ isPending }] = usePayPalScriptReducer();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const subscriptionIdRef = useRef<string>("");
  // Keep the latest selected country in a ref so the PayPal create-callbacks
  // (created once) always read the current value, never a stale closure.
  const countryRef = useRef<string>(country);
  useEffect(() => {
    countryRef.current = country;
  }, [country]);

  if (processing) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold">
          {isRecurring ? "Setting up your subscription…" : "Processing your payment…"}
        </p>
        <p className="text-xs text-muted-foreground">Please wait, do not close this page.</p>
      </div>
    );
  }

  return (
    <>
      {isPending && (
        <div className="space-y-3">
          <div className="h-12 rounded-xl bg-border animate-pulse" />
          <div className="h-12 rounded-xl bg-border animate-pulse" />
        </div>
      )}

      <div className={isPending ? "hidden" : ""}>
        {isRecurring ? (
          <PayPalButtons
            style={{ layout: "vertical", shape: "rect", label: "subscribe" }}
            disabled={!country}
            createSubscription={async () => {
              setError(null);
              const { subscriptionId } = await createSubscriptionService(planId, countryRef.current || undefined);
              subscriptionIdRef.current = subscriptionId;
              return subscriptionId;
            }}
            onApprove={async () => {
              setProcessing(true);
              // Poll until BILLING.SUBSCRIPTION.ACTIVATED webhook fires (max 60s)
              let active = false;
              const deadline = Date.now() + 60_000;
              while (Date.now() < deadline) {
                await new Promise((r) => setTimeout(r, 3_000));
                try {
                  const { status } = await getSubscriptionStatusService(subscriptionIdRef.current);
                  if (status === "ACTIVE") { active = true; break; }
                } catch {}
              }
              // If it never activated, send them to a "processing" state instead of
              // claiming success — the activation webhook may still be in flight.
              router.push(`/checkout/success?plugin=${pluginSlug}${active ? "" : "&pending=1"}`);
            }}
            onError={() => {
              setProcessing(false);
              setError("Subscription setup failed. Please try again or contact support.");
            }}
          />
        ) : (
          <PayPalButtons
            style={{ layout: "vertical", shape: "rect", label: "pay" }}
            disabled={!country}
            createOrder={async () => {
              setError(null);
              const { paypalOrderId } = await createOrderService(pluginId, planId, countryRef.current || undefined);
              return paypalOrderId;
            }}
            onApprove={async (data) => {
              setProcessing(true);
              await captureOrderService(data.orderID);
              router.push(`/checkout/success?plugin=${pluginSlug}`);
            }}
            onError={() => {
              setProcessing(false);
              setError("Payment failed. Please try again or contact support.");
            }}
          />
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CheckoutForm({ pluginId, pluginSlug, plugin, plan }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const confirm = useConfirm();
  const pricing = getPlanPricing(plan, plugin.discountSettings, user);
  const isRecurring = plan.billingType === "RECURRING";

  // The PayPal SDK options MUST keep a stable identity — PayPalScriptProvider reloads
  // the whole SDK whenever this object's reference changes, which would wipe
  // window.paypal on every re-render (e.g. selecting the billing country). Memoise it
  // so the SDK loads once and only re-loads if the billing intent actually changes.
  const paypalOptions = useMemo<ComponentProps<typeof PayPalScriptProvider>["options"]>(
    () => ({
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
      currency: "USD",
      ...(isRecurring
        ? { vault: true, intent: "subscription" }
        : { intent: "capture" }),
    }),
    [isRecurring],
  );

  // Detect an existing active subscription for this plugin so a returning user
  // sees "subscribed + unsubscribe" instead of the subscribe buttons again.
  const { data: subscriptions, isLoading: subsLoading } = useMySubscriptions(!!user);
  const { data: licenses, isLoading: licensesLoading } = useMyLicenses(!!user);
  const qc = useQueryClient();
  // Match the SAME plan — if the user is switching UP to a different (higher) tier,
  // they should see the Subscribe flow, not the "already subscribed" state.
  const activeSubscription = subscriptions?.find(
    (s) => s.plugin.id === pluginId && s.status === "ACTIVE" && s.plan.id === plan.id,
  );

  // A sub that was cancelled but is still inside its paid period: the user keeps access
  // until currentPeriodEnd and must NOT be offered the subscribe buttons again (that would
  // create a duplicate subscription). Mirrors the plugin page's "Subscription cancelled" state.
  const cancelledSubscription = subscriptions?.find(
    (s) =>
      s.plugin.id === pluginId &&
      s.status === "CANCELLED" &&
      s.plan.id === plan.id &&
      new Date(s.currentPeriodEnd) > new Date(),
  );

  // A still-valid one-time license for THIS exact plan (already purchased).
  const ownedLicense = licenses?.find(
    (l) =>
      l.plugin.id === pluginId &&
      l.plan.id === plan.id &&
      l.status === "ACTIVE" &&
      (!l.expiresAt || new Date(l.expiresAt) > new Date()),
  );

  const [cancelling, setCancelling] = useState(false);
  const [cancelledUntil, setCancelledUntil] = useState<string | null>(null);
  // Billing country the buyer selects — saved with the purchase so we know which
  // countries customers are buying from. Required before the PayPal buttons enable.
  const [country, setCountry] = useState("");
  const countryOptions = useMemo(() => getCountryOptions(), []);

  // Either just-cancelled on this page, or already cancelled-but-still-valid on load.
  const cancelledAccessUntil = cancelledUntil ?? cancelledSubscription?.currentPeriodEnd ?? null;

  // Extra protection: if the user already holds THIS plan (active sub, cancelled-but-valid
  // sub, or a valid one-time license), don't open checkout for it at all — bounce them back
  // to the plugin page (the management surface). This closes the duplicate-purchase path
  // even if someone lands here via a stale/shared link. Upgrades to a different (higher)
  // plan have a different plan.id, so they are NOT affected.
  const alreadyOwnsThisPlan = !!activeSubscription || !!cancelledSubscription || !!ownedLicense;
  const loading = subsLoading || licensesLoading;
  // Don't redirect right after they cancelled ON this page — show the confirmation first.
  const redirecting = alreadyOwnsThisPlan && !cancelledUntil;

  useEffect(() => {
    if (redirecting) router.replace(`/plugins/${pluginSlug}`);
  }, [redirecting, router, pluginSlug]);

  const handleUnsubscribe = async () => {
    if (!activeSubscription) return;
    const ok = await confirm({
      title: "Cancel subscription?",
      description: (
        <>
          Your subscription <strong>won&apos;t renew</strong> — you won&apos;t be charged again.
          Your license <strong>stays active until {formatDate(activeSubscription.currentPeriodEnd)}</strong>, then access ends.
        </>
      ),
      confirmLabel: "Cancel subscription",
      cancelLabel: "Keep subscription",
      tone: "danger",
    });
    if (!ok) return;
    setCancelling(true);
    try {
      await cancelSubscriptionService(activeSubscription.paypalSubscriptionId);
      setCancelledUntil(activeSubscription.currentPeriodEnd);
      await qc.invalidateQueries({ queryKey: ["my-subscriptions"] });
    } catch {
      // subscription data will refresh naturally
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-surface p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold">Account</h3>
        <div className="mt-4">
          <label className="text-sm font-semibold">Email</label>
          <div className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-muted-foreground">
            {user?.email ?? "—"}
          </div>
        </div>
      </div>

      <div className="card-surface p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold">Payment</h3>

        {redirecting ? (
          /* Already owns this plan — bounce back to the plugin page. */
          <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-4 py-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-semibold">You already have this plan</p>
            <p className="text-xs text-muted-foreground">Taking you back to the plugin…</p>
          </div>
        ) : cancelledAccessUntil ? (
          /* Just cancelled on this page — confirmation, no renew/re-subscribe offered, per design. */
          <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-4 py-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm font-semibold">Subscription cancelled</p>
            <p className="text-xs text-muted-foreground">
              You&apos;ll keep access until {formatDate(cancelledAccessUntil)}. It will not renew.
            </p>
          </div>
        ) : activeSubscription ? (
          /* Returning subscriber — show purchased state + unsubscribe. */
          <>
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-700">
                  You&apos;re subscribed to this plan
                </p>
                <p className="text-xs text-green-700/80">
                  Next charge on {formatDate(activeSubscription.currentPeriodEnd)}.
                </p>
              </div>
            </div>

            <button
              onClick={handleUnsubscribe}
              disabled={cancelling}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-300 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
              Unsubscribe
            </button>
          </>
        ) : loading ? (
          <div className="mt-5 flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          /* Not subscribed — normal subscribe / purchase flow. */
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              {isRecurring
                ? "You will be redirected to PayPal to set up your subscription."
                : "You will be redirected to PayPal to complete your purchase securely."}
            </p>

            <div className="mt-5">
              <label htmlFor="billing-country" className="text-sm font-semibold">
                Billing country
              </label>
              <select
                id="billing-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Select your country…</option>
                {countryOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              {!country && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Select your country to continue to payment.
                </p>
              )}
            </div>

            <div className="mt-5">
              <PayPalScriptProvider options={paypalOptions}>
                <PayPalSection
                  pluginId={pluginId}
                  pluginSlug={pluginSlug}
                  planId={plan.id}
                  isRecurring={isRecurring}
                  country={country}
                />
              </PayPalScriptProvider>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              {isRecurring ? "Recurring charge:" : "Total due today:"}{" "}
              <span className="font-semibold text-foreground">
                ${pricing.final.toFixed(2)} USD {billingLabel(plan)}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
