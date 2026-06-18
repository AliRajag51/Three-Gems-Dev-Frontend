import api from "@/lib/services";
import type { DiscountSettings } from "@/lib/types/plugin";

// What the admin form sends. `globalDays` controls the campaign window (0 = no end date);
// the backend converts it into the stored `globalEndsAt`.
export type DiscountSettingsInput = {
  globalPercent?: number;
  globalDays?: number;
  newUserPercent?: number;
  newUserDays?: number;
};

export const getDiscountSettings = async (): Promise<DiscountSettings> => {
  const res = await api.get("/admin/discount-settings");
  return res.data.data.setting;
};

export const updateDiscountSettings = async (
  data: DiscountSettingsInput,
): Promise<DiscountSettings> => {
  const res = await api.put("/admin/discount-settings", data);
  return res.data.data.setting;
};
