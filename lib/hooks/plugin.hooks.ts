"use client";

import { useQuery } from "@tanstack/react-query";
import { getPluginsService, getPluginBySlugService } from "@/lib/services/plugin.service";
import { useAuth } from "@/lib/context/auth.context";

export function usePlugins() {
  // Scope by user: the catalog includes private plugins/plans the viewer is allowed to
  // see, so the cache must differ per user and refetch on login/logout (the key changes).
  const { user } = useAuth();
  return useQuery({
    queryKey: ["plugins", user?.id ?? "guest"],
    queryFn: getPluginsService,
  });
}

export function usePlugin(slug: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["plugin", slug, user?.id ?? "guest"],
    queryFn: () => getPluginBySlugService(slug),
    enabled: !!slug,
    // A 404 (not found) or 403 (deactivated) is a final answer — don't retry it,
    // so the page shows its message immediately instead of after several retries.
    retry: (count, err) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 403) return false;
      return count < 3;
    },
  });
}
