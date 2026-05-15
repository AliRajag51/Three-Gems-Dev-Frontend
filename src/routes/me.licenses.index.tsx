/**
 * /me/licenses — customer dashboard list of the caller's licenses.
 *
 * The backend's list endpoint returns `LicensePublic[]` without `activations`
 * and without the plugin name (only `pluginId`). To render readable rows we
 * also fetch the public plugin catalog once and build a `pluginId → summary`
 * map; this is cheap because the catalog is small (a handful of products) and
 * already heavily cached server-side.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronRight, Gem, KeyRound } from "lucide-react";

import { RequireAuth } from "@/components/require-auth";
import { LicenseStatusBadge } from "@/components/license-status-badge";
import { licensesApi } from "@/lib/api/licenses";
import { catalogApi } from "@/lib/api/catalog";
import type { LicensePublic, PluginSummary } from "@/lib/api/types";

const licensesListQueryOptions = {
  queryKey: ["licenses", "list"] as const,
  queryFn: () => licensesApi.listLicenses({ limit: 50 }),
};

const pluginsListQueryOptions = {
  queryKey: ["plugins", "list", "all"] as const,
  // 100 is well above the realistic plugin catalog size; one round-trip is
  // fine and TanStack Query will share this cache with other consumers.
  queryFn: () => catalogApi.listPlugins({ limit: 100 }),
};

export const Route = createFileRoute("/me/licenses/")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(licensesListQueryOptions),
      queryClient.ensureQueryData(pluginsListQueryOptions),
    ]);
  },
  head: () => ({
    meta: [{ title: "Your licenses — Three Gems" }],
  }),
  component: LicensesIndexRoute,
});

function LicensesIndexRoute() {
  return (
    <RequireAuth>
      <LicensesIndexPage />
    </RequireAuth>
  );
}

function LicensesIndexPage() {
  const { data: licensesPage } = useSuspenseQuery(licensesListQueryOptions);
  const { data: pluginsPage } = useSuspenseQuery(pluginsListQueryOptions);

  const pluginsById = new Map<string, PluginSummary>(pluginsPage.items.map((p) => [p.id, p]));

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Your licenses
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage activations, renew updates, and view license details.
          </p>
        </div>
      </header>

      {licensesPage.items.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="mt-8 card-surface divide-y divide-border overflow-hidden">
          {licensesPage.items.map((license) => (
            <LicenseRow
              key={license.id}
              license={license}
              plugin={pluginsById.get(license.pluginId) ?? null}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function LicenseRow({ license, plugin }: { license: LicensePublic; plugin: PluginSummary | null }) {
  const pluginName = plugin?.name ?? "Unknown plugin";
  const activationsLabel = formatActivationsSummary(license.maxActivations);
  const expiresLabel = formatExpiryLabel(license);

  return (
    <li>
      <Link
        to="/me/licenses/$id"
        params={{ id: license.id }}
        className="flex items-center gap-4 p-5 hover:bg-muted/40 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
          <Gem className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display font-bold truncate">{pluginName}</p>
            <LicenseStatusBadge status={license.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground font-mono truncate">
            {license.keyPrefix}…
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end text-xs text-muted-foreground shrink-0">
          <span>{activationsLabel}</span>
          {expiresLabel && <span className="mt-0.5">{expiresLabel}</span>}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </Link>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 card-surface p-12 text-center">
      <span className="grid place-items-center w-12 h-12 mx-auto rounded-2xl bg-primary-soft text-primary">
        <KeyRound className="w-6 h-6" />
      </span>
      <h2 className="mt-4 font-display text-xl font-bold">You don't own any licenses yet</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        Once you purchase a plugin, your license keys and activations will live here.
      </p>
      <Link
        to="/plugins"
        className="btn-ruby inline-block mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold"
      >
        Browse plugins
      </Link>
    </div>
  );
}

function formatActivationsSummary(maxActivations: number | null): string {
  // The list response doesn't include the current activation count, so we
  // show capacity only. The detail view shows the real "used of total".
  if (maxActivations == null) return "Unlimited sites";
  return `${maxActivations} site${maxActivations === 1 ? "" : "s"}`;
}

function formatExpiryLabel(license: LicensePublic): string | null {
  if (license.expiresAt) {
    return `Renews ${format(new Date(license.expiresAt), "MMM d, yyyy")}`;
  }
  if (license.updatesExpireAt) {
    return `Updates until ${format(new Date(license.updatesExpireAt), "MMM d, yyyy")}`;
  }
  return null;
}
