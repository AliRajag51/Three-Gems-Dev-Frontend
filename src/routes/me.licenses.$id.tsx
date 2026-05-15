/**
 * /me/licenses/:id — single-license detail.
 *
 * Layout: two-column on lg+ — left column is "what you have" (plugin, key,
 * pricing, dates), right column is "what you can do" (renew / cancel / resume
 * + the activations list with deactivate buttons).
 *
 * Finding the subscription for a SUBSCRIPTION license: the public license
 * projection deliberately doesn't expose `subscriptionId`, so we list the
 * caller's subscriptions and match by `(pluginId, pricingOptionId)`. A user
 * could in principle have multiple subscriptions for the same pricing option
 * over time, so we prefer one whose status is not `canceled` if available.
 */
import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { format, formatDistanceToNowStrict } from "date-fns";
import { ArrowLeft, ExternalLink, Globe, Loader2 } from "lucide-react";

import { RequireAuth } from "@/components/require-auth";
import { LicenseStatusBadge } from "@/components/license-status-badge";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { licensesApi } from "@/lib/api/licenses";
import { catalogApi } from "@/lib/api/catalog";
import { billingApi } from "@/lib/api/billing";
import { ApiError } from "@/lib/api/client";
import type {
  LicenseActivationPublic,
  LicensePublic,
  PluginDetail,
  PluginPricingOptionPublic,
  PluginSummary,
  SubscriptionSummary,
} from "@/lib/api/types";

const licenseQueryOptions = (id: string) => ({
  queryKey: ["licenses", "detail", id] as const,
  queryFn: () => licensesApi.getLicense(id),
});

const pluginsListQueryOptions = {
  queryKey: ["plugins", "list", "all"] as const,
  queryFn: () => catalogApi.listPlugins({ limit: 100 }),
};

const subscriptionsListQueryOptions = {
  queryKey: ["subscriptions", "list"] as const,
  queryFn: () => billingApi.listSubscriptions({ limit: 50 }),
};

export const Route = createFileRoute("/me/licenses/$id")({
  loader: async ({ params, context: { queryClient } }) => {
    try {
      await queryClient.ensureQueryData(licenseQueryOptions(params.id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) throw notFound();
      throw err;
    }
  },
  head: () => ({ meta: [{ title: "License — Three Gems" }] }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">License not found</h1>
      <p className="mt-3 text-muted-foreground">
        We couldn't find that license, or it doesn't belong to your account.
      </p>
      <Link
        to="/me/licenses"
        className="btn-ruby inline-block mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold"
      >
        Back to licenses
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Couldn't load license</h1>
      <p className="mt-3 text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: LicenseDetailRoute,
});

function LicenseDetailRoute() {
  return (
    <RequireAuth>
      <LicenseDetailPage />
    </RequireAuth>
  );
}

function LicenseDetailPage() {
  const { id } = Route.useParams();
  const { data: license } = useSuspenseQuery(licenseQueryOptions(id));

  // These two are non-suspense — we want the page to render even if they're
  // slower than the license fetch (e.g. catalog cold cache).
  const pluginsQuery = useQuery(pluginsListQueryOptions);
  const plugin = pluginsQuery.data?.items.find((p) => p.id === license.pluginId) ?? null;

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12">
      <Link
        to="/me/licenses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        All licenses
      </Link>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PluginHeader license={license} plugin={plugin} />
          <KeyCard license={license} />
          <PricingCard license={license} plugin={plugin} />
        </div>
        <div className="space-y-6">
          <ActionsCard license={license} plugin={plugin} />
          <ActivationsCard license={license} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Left column ---------------- */

function PluginHeader({
  license,
  plugin,
}: {
  license: LicensePublic;
  plugin: PluginSummary | null;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
        {plugin?.name ?? "Plugin"}
      </h1>
      <LicenseStatusBadge status={license.status} />
    </div>
  );
}

function KeyCard({ license }: { license: LicensePublic }) {
  return (
    <section className="card-surface p-6">
      <h2 className="font-display text-lg font-bold">License key</h2>
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <code className="font-mono text-sm bg-muted rounded-lg px-3 py-2 break-all">
          {license.keyPrefix}…
        </code>
        <CopyButton value={license.keyPrefix} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
        Save this key — it's the prefix only; the full key was shown once at issue. If you lost it,
        contact support.
      </p>
    </section>
  );
}

function PricingCard({
  license,
  plugin,
}: {
  license: LicensePublic;
  plugin: PluginSummary | null;
}) {
  const detailQuery = useQuery({
    queryKey: ["plugins", "detail", plugin?.slug ?? ""] as const,
    queryFn: () => catalogApi.getPlugin(plugin!.slug),
    enabled: Boolean(plugin?.slug),
  });

  const option =
    detailQuery.data?.pricingOptions.find((o) => o.id === license.pricingOptionId) ?? null;

  return (
    <section className="card-surface p-6">
      <h2 className="font-display text-lg font-bold">Plan</h2>
      {detailQuery.isLoading ? (
        <p className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading plan details…
        </p>
      ) : option ? (
        <PricingOptionSummary option={option} />
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Plan details unavailable for this license.
        </p>
      )}

      <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <DateField label="Purchased" value={license.createdAt} />
        <DateField label="Updates until" value={license.updatesExpireAt} />
        {license.expiresAt && <DateField label="Access until" value={license.expiresAt} />}
      </dl>
    </section>
  );
}

function PricingOptionSummary({ option }: { option: PluginPricingOptionPublic }) {
  const price = formatPrice(option.priceCents, option.currency);
  const intro =
    option.introPriceCents != null
      ? `${formatPrice(option.introPriceCents, option.currency)} intro, then ${price}`
      : null;
  const cadence =
    option.paymentType === "SUBSCRIPTION" && option.billingInterval
      ? `/ ${option.billingInterval.toLowerCase()}`
      : null;

  return (
    <div className="mt-3 text-sm">
      <p className="font-semibold">{option.label}</p>
      <p className="text-muted-foreground mt-0.5">
        {intro ?? price}
        {cadence && <span className="ml-1">{cadence}</span>}
        {" · "}
        {option.paymentType === "SUBSCRIPTION" ? "Subscription" : "One-time purchase"}
      </p>
    </div>
  );
}

function DateField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
        {label}
      </dt>
      <dd className="mt-1 font-medium">{value ? format(new Date(value), "MMM d, yyyy") : "—"}</dd>
    </div>
  );
}

/* ---------------- Right column ---------------- */

function ActionsCard({
  license,
  plugin,
}: {
  license: LicensePublic;
  plugin: PluginSummary | null;
}) {
  const detailQuery = useQuery({
    queryKey: ["plugins", "detail", plugin?.slug ?? ""] as const,
    queryFn: () => catalogApi.getPlugin(plugin!.slug),
    enabled: Boolean(plugin?.slug),
  });

  const option =
    detailQuery.data?.pricingOptions.find((o) => o.id === license.pricingOptionId) ?? null;

  return (
    <section className="card-surface p-6">
      <h2 className="font-display text-lg font-bold">Manage</h2>
      <div className="mt-4">
        {option?.paymentType === "SUBSCRIPTION" ? (
          <SubscriptionActions license={license} pluginDetail={detailQuery.data ?? null} />
        ) : option?.paymentType === "ONE_TIME" ? (
          <RenewAction licenseId={license.id} />
        ) : (
          <p className="text-sm text-muted-foreground">Loading available actions…</p>
        )}
      </div>
    </section>
  );
}

function RenewAction({ licenseId }: { licenseId: string }) {
  const mutation = useMutation({
    mutationFn: () => licensesApi.renewLicense(licenseId),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });

  const errorMessage = errorToMessage(mutation.error);

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Extend your update window. You'll be redirected to Stripe to complete payment.
      </p>
      <Button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="btn-ruby mt-4 w-full rounded-xl text-sm font-semibold"
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Redirecting…
          </>
        ) : (
          <>
            Renew updates
            <ExternalLink className="w-4 h-4" />
          </>
        )}
      </Button>
      {errorMessage && <p className="mt-3 text-xs text-destructive">{errorMessage}</p>}
    </div>
  );
}

function SubscriptionActions({
  license,
  pluginDetail,
}: {
  license: LicensePublic;
  pluginDetail: PluginDetail | null;
}) {
  const queryClient = useQueryClient();
  const subsQuery = useQuery(subscriptionsListQueryOptions);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const subscription = findSubscriptionForLicense(subsQuery.data?.items ?? [], license);

  const cancelMutation = useMutation({
    mutationFn: (id: string) => billingApi.cancelSubscription(id),
    onSuccess: () => {
      setConfirmOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["subscriptions", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["licenses", "detail", license.id] });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: (id: string) => billingApi.resumeSubscription(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["subscriptions", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["licenses", "detail", license.id] });
    },
  });

  if (subsQuery.isLoading) {
    return (
      <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading subscription…
      </p>
    );
  }

  if (!subscription) {
    // The matching subscription couldn't be found. Avoid offering actions we
    // can't actually perform (see file header for rationale).
    return (
      <p className="text-sm text-muted-foreground">
        This license is tied to a subscription that we couldn't locate. Please contact support if
        you need to cancel or resume billing.
      </p>
    );
  }

  if (subscription.cancelAtPeriodEnd) {
    const cancelOn = format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy");
    const resumeError = errorToMessage(resumeMutation.error);
    return (
      <div>
        <p className="text-sm text-muted-foreground">
          Cancels on <span className="font-semibold text-foreground">{cancelOn}</span>. You can
          resume at any time before then.
        </p>
        <Button
          type="button"
          onClick={() => resumeMutation.mutate(subscription.id)}
          disabled={resumeMutation.isPending}
          className="btn-ruby mt-4 w-full rounded-xl text-sm font-semibold"
        >
          {resumeMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Resuming…
            </>
          ) : (
            "Resume subscription"
          )}
        </Button>
        {resumeError && <p className="mt-3 text-xs text-destructive">{resumeError}</p>}
      </div>
    );
  }

  const renewsOn = format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy");
  const cancelError = errorToMessage(cancelMutation.error);
  const planLabel =
    pluginDetail?.pricingOptions.find((o) => o.id === license.pricingOptionId)?.label ??
    "this plan";

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Renews <span className="font-semibold text-foreground">{renewsOn}</span>.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={() => setConfirmOpen(true)}
        className="mt-4 w-full rounded-xl text-sm font-semibold"
      >
        Cancel subscription
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel subscription?</DialogTitle>
            <DialogDescription>
              Your access to {planLabel} continues until {renewsOn}. After that, the license will
              stop receiving updates and may be revoked.
            </DialogDescription>
          </DialogHeader>
          {cancelError && (
            <p className="text-sm text-destructive" role="alert">
              {cancelError}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={cancelMutation.isPending}
            >
              Keep subscription
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => cancelMutation.mutate(subscription.id)}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Cancelling…
                </>
              ) : (
                "Confirm cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActivationsCard({ license }: { license: LicensePublic }) {
  const activations = license.activations ?? [];
  const active = activations.filter((a) => !a.deactivatedAt);

  return (
    <section className="card-surface p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold">Activations</h2>
        <span className="text-xs text-muted-foreground">
          {active.length} of {license.maxActivations ?? "∞"}
        </span>
      </div>
      {activations.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No sites activated yet. Use the license key in your WordPress plugin's settings to
          activate.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {activations.map((activation) => (
            <ActivationRow key={activation.id} activation={activation} licenseId={license.id} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ActivationRow({
  activation,
  licenseId,
}: {
  activation: LicenseActivationPublic;
  licenseId: string;
}) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () => licensesApi.deactivateActivation(licenseId, activation.id),
    onSuccess: () => {
      setConfirmOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["licenses", "detail", licenseId] });
      void queryClient.invalidateQueries({ queryKey: ["licenses", "list"] });
    },
  });

  const isDeactivated = Boolean(activation.deactivatedAt);
  const errorMessage = errorToMessage(mutation.error);

  return (
    <li className="rounded-xl border border-border p-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted text-muted-foreground grid place-items-center shrink-0">
          <Globe className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{activation.siteUrl}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Activated {format(new Date(activation.activatedAt), "MMM d, yyyy")} · Last seen{" "}
            {formatDistanceToNowStrict(new Date(activation.lastSeenAt), { addSuffix: true })}
          </p>
          {isDeactivated && (
            <p className="text-xs text-muted-foreground mt-0.5 italic">
              Deactivated {format(new Date(activation.deactivatedAt!), "MMM d, yyyy")}
            </p>
          )}
        </div>
        {!isDeactivated && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="text-xs"
          >
            Deactivate
          </Button>
        )}
      </div>
      {errorMessage && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate this site?</DialogTitle>
            <DialogDescription>
              The plugin on <span className="font-semibold">{activation.siteUrl}</span> will stop
              receiving updates until you re-activate it with this license key.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Deactivating…
                </>
              ) : (
                "Confirm deactivate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}

/* ---------------- helpers ---------------- */

function findSubscriptionForLicense(
  subscriptions: SubscriptionSummary[],
  license: LicensePublic,
): SubscriptionSummary | null {
  const matches = subscriptions.filter(
    (s) => s.pluginId === license.pluginId && s.pricingOptionId === license.pricingOptionId,
  );
  if (matches.length === 0) return null;
  // Prefer one that isn't fully canceled; ties break on most recent.
  const live = matches.filter((s) => s.status.toLowerCase() !== "canceled");
  const pool = live.length > 0 ? live : matches;
  return [...pool].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
}

function formatPrice(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

function errorToMessage(err: unknown): string | null {
  if (!err) return null;
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
