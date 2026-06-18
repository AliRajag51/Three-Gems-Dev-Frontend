import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPlugins, getAdminPlugin,
  createPlugin, updatePlugin, deletePlugin,
  getCustomerCount, getAdminNotificationCount,
  getCountryAnalytics, getPluginCountryAnalytics,
} from "@/lib/services/admin.service";

export function useCountryAnalytics() {
  return useQuery({
    queryKey: ["admin-country-analytics"],
    queryFn: getCountryAnalytics,
  });
}

export function usePluginCountryAnalytics(pluginId: string, enabled = true) {
  return useQuery({
    queryKey: ["admin-plugin-country-analytics", pluginId],
    queryFn: () => getPluginCountryAnalytics(pluginId),
    enabled: enabled && !!pluginId,
  });
}

// The admin header bell goes stale after 2 minutes and re-fetches on that cadence,
// so an admin can see new/closed support tickets and contact messages appear.
const NOTIFICATION_STALE_MS = 120_000;

export function useAdminNotifications(enabled = true) {
  return useQuery({
    queryKey: ["admin-notification-count"],
    queryFn: getAdminNotificationCount,
    enabled,
    staleTime: NOTIFICATION_STALE_MS,
    refetchInterval: enabled ? NOTIFICATION_STALE_MS : false,
    refetchOnWindowFocus: true,
  });
}

export function useAdminPlugins() {
  return useQuery({
    queryKey: ["admin-plugins"],
    queryFn: getAdminPlugins,
  });
}

export function useCustomerCount() {
  return useQuery({
    queryKey: ["admin-customer-count"],
    queryFn: getCustomerCount,
  });
}

export function useAdminPlugin(id: string) {
  return useQuery({
    queryKey: ["admin-plugin", id],
    queryFn: () => getAdminPlugin(id),
    enabled: !!id,
  });
}

export function useCreatePlugin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPlugin,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-plugins"] }),
  });
}

export function useUpdatePlugin(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updatePlugin>[1]) => updatePlugin(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-plugin", id] });
      qc.invalidateQueries({ queryKey: ["admin-plugins"] });
    },
  });
}

export function useDeletePlugin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePlugin,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-plugins"] }),
  });
}

export function useTogglePluginStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updatePlugin(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-plugins"] }),
  });
}
