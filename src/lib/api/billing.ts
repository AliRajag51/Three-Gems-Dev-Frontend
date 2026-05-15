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

export interface CheckoutSessionStatus {
  status: string;
  paymentStatus: string | null;
  customerEmail: string | null;
  amountTotal: number | null;
  currency: string | null;
  externalSessionId: string;
  /** Set once our webhook has processed the completion and an Order row exists. */
  orderId: string | null;
  /** When a fresh issuance happens at success time, we surface plaintext keys ONCE here. */
  licenses?: Array<{ id: string; keyPrefix: string; plaintextKey?: string }>;
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
    return api.get<ListSubscriptionsResponse>("/api/v1/me/subscriptions", { searchParams: options });
  },
  getSubscription(id: string) {
    return api.get<SubscriptionSummary>(`/api/v1/me/subscriptions/${encodeURIComponent(id)}`);
  },
  cancelSubscription(id: string) {
    return api.post<SubscriptionSummary>(`/api/v1/me/subscriptions/${encodeURIComponent(id)}/cancel`);
  },
  resumeSubscription(id: string) {
    return api.post<SubscriptionSummary>(`/api/v1/me/subscriptions/${encodeURIComponent(id)}/resume`);
  },
};
