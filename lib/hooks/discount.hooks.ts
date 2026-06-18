import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDiscountSettings, updateDiscountSettings } from "@/lib/services/discount.service";

export function useDiscountSettings() {
  return useQuery({
    queryKey: ["discount-settings"],
    queryFn: getDiscountSettings,
  });
}

export function useUpdateDiscountSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateDiscountSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discount-settings"] }),
  });
}
