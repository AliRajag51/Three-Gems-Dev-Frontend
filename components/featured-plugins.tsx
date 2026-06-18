"use client";

import { useMemo } from "react";
import { usePlugins } from "@/lib/hooks/plugin.hooks";
import { useMyLicenses } from "@/lib/hooks/license.hooks";
import { useAuth } from "@/lib/context/auth.context";
import { PluginCard } from "@/components/plugin-card";
import { PluginGridSkeleton } from "@/components/skeletons/plugin-card-skeleton";

export function FeaturedPlugins() {
  const { user } = useAuth();
  const { data: plugins, isLoading, isError } = usePlugins();
  const { data: licenses } = useMyLicenses(!!user);

  const purchasedIds = useMemo(() => {
    const now = Date.now();
    return new Set(
      (licenses ?? [])
        .filter(
          (l) =>
            l.status === "ACTIVE" &&
            (!l.expiresAt || new Date(l.expiresAt).getTime() > now),
        )
        .map((l) => l.plugin.id),
    );
  }, [licenses]);

  if (isLoading) {
    return <PluginGridSkeleton count={6} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" />;
  }

  if (isError || !plugins?.length) {
    return (
      <p className="text-center py-16 text-muted-foreground">No plugins available yet.</p>
    );
  }

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {plugins.slice(0, 6).map((p) => (
        <PluginCard key={p.slug} p={p} purchased={purchasedIds.has(p.id)} />
      ))}
    </div>
  );
}
