import api from "@/lib/services";

export const createOrderService = async (
  pluginId: string,
  planId: string,
  country?: string | null,
): Promise<{ paypalOrderId: string; orderId: string }> => {
  const res = await api.post("/payments/create-order", { pluginId, planId, country });
  return res.data.data;
};

export const captureOrderService = async (
  paypalOrderId: string,
): Promise<{ success: boolean; orderId: string; licenseKey: string | null }> => {
  const res = await api.post("/payments/capture-order", { paypalOrderId });
  return res.data.data;
};
