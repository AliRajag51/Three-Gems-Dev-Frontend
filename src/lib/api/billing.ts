/**
 * Billing API surface — checkout creation, order/subscription reads,
 * subscription lifecycle.
 *
 * Backend: src/modules/billing/billing.controller.ts. All endpoints require
 * an authenticated session (the global Better-Auth guard).
 */
import { api } from "./client";
import type {
  CreateCheckoutSessionInput,
  CreateCheckoutSessionResponse,
  ListOrdersResponse,
  ListSubscriptionsResponse,
  OrderSummary,
  SubscriptionSummary,
} from "./types";

/**
 * Mirrors the backend's `BillingService.getCheckoutSession` return shape, which
 * is intentionally minimal: it looks up our local `Order` row by external session
 * id and returns `{ status, orderId }`. While the Stripe webhook is in flight,
 * the order doesn't exist yet and the endpoint responds 404 — the success page
 * treats that as "keep polling".
 *
 * Plaintext license keys are NOT returned here; they are delivered via the
 * purchase-confirmation email and only the masked `keyPrefix` is ever visible
 * in the UI afterwards (see /me/licenses).
 */
export interface CheckoutSessionStatus {
  status: string;
  orderId: string | null;
}

export const billingApi = {
  /** Creates a Stripe Checkout Session; returns the URL to redirect the customer to. */
  createCheckoutSession(input: CreateCheckoutSessionInput) {
    return api.post<CreateCheckoutSessionResponse>("/api/v1/checkout/session", input);
  },

  /**
   * Polled by /checkout/success while we wait for Stripe's webhook to land.
   * Backend reads Stripe's checkout.sessions.retrieve and joins to our Order
   * row if one's been created yet.
   */
  getCheckoutSession(externalSessionId: string) {
    return api.get<CheckoutSessionStatus>(
      `/api/v1/checkout/session/${encodeURIComponent(externalSessionId)}`,
    );
  },

  listOrders(options: { limit?: number; cursor?: string } = {}) {
    return api.get<ListOrdersResponse>("/api/v1/me/orders", { searchParams: options });
  },
  getOrder(id: string) {
    return api.get<OrderSummary>(`/api/v1/me/orders/${encodeURIComponent(id)}`);
  },

  listSubscriptions(options: { limit?: number; cursor?: string } = {}) {
    return api.get<ListSubscriptionsResponse>("/api/v1/me/subscriptions", {
      searchParams: options,
    });
  },
  getSubscription(id: string) {
    return api.get<SubscriptionSummary>(`/api/v1/me/subscriptions/${encodeURIComponent(id)}`);
  },
  cancelSubscription(id: string) {
    return api.post<SubscriptionSummary>(
      `/api/v1/me/subscriptions/${encodeURIComponent(id)}/cancel`,
    );
  },
  resumeSubscription(id: string) {
    return api.post<SubscriptionSummary>(
      `/api/v1/me/subscriptions/${encodeURIComponent(id)}/resume`,
    );
  },
};
