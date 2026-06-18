import api from "@/lib/services";

export type SubscriptionItem = {
  id: string;
  paypalSubscriptionId: string;
  status: "PENDING" | "ACTIVE" | "CANCELLED" | "SUSPENDED" | "EXPIRED";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  plugin: { id: string; name: string; slug: string; iconUrl: string | null };
  plan: {
    id: string;
    name: string;
    billingIntervalUnit: string | null;
    billingIntervalCount: number | null;
    priceUsd: string;
  };
};

export const createSubscriptionService = async (
  planId: string,
  country?: string | null,
): Promise<{ subscriptionId: string }> => {
  const res = await api.post("/subscriptions/create", { planId, country });
  return res.data.data;
};

export const cancelSubscriptionService = async (
  subscriptionId: string,
): Promise<{ success: boolean }> => {
  const res = await api.post("/subscriptions/cancel", { subscriptionId });
  return res.data.data;
};

export const getMySubscriptionsService = async (): Promise<SubscriptionItem[]> => {
  const res = await api.get("/subscriptions/my");
  return res.data.data;
};

export const getSubscriptionStatusService = async (
  id: string,
): Promise<{ status: string }> => {
  const res = await api.get(`/subscriptions/status?id=${encodeURIComponent(id)}`);
  return res.data.data;
};
