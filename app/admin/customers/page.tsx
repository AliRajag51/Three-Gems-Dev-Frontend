"use client";

import { useMemo, useState } from "react";
import { Loader2, UserPlus, Check, Copy, KeyRound, Users, Mail, Plus } from "lucide-react";
import {
  useAdminPlugins,
  useAdminPlugin,
  useManagedCustomers,
  useProvisionCustomer,
  useSetCustomerEmails,
  useGrantLicense,
} from "@/lib/hooks/admin.hooks";
import type { Plan } from "@/lib/types/admin";

const inp =
  "mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary disabled:opacity-60";

const planLabel = (p: Plan) => {
  const sites = p.siteLimit === 0 ? "Unlimited sites" : `${p.siteLimit} site${p.siteLimit === 1 ? "" : "s"}`;
  const term =
    p.billingType === "RECURRING"
      ? `every ${p.billingIntervalCount ?? 1} ${(p.billingIntervalUnit ?? "MONTH").toLowerCase()}`
      : p.durationDays === 0
        ? "lifetime"
        : `${p.durationDays} days`;
  return `${p.name} — ${sites} · ${term} · $${Number(p.priceUsd).toFixed(2)}`;
};

export default function AdminCustomersPage() {
  const { data: plugins = [] } = useAdminPlugins();
  const { data: customers = [], isLoading: customersLoading } = useManagedCustomers();
  const provision = useProvisionCustomer();
  const setEmails = useSetCustomerEmails();
  const grant = useGrantLicense();

  const [form, setForm] = useState({ name: "", email: "", password: "", pluginId: "", planId: "" });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ email: string; licenseKey: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [enabledMsg, setEnabledMsg] = useState<string | null>(null);

  // "Add plugin to an existing customer" — one inline grant form open at a time.
  const [grantFor, setGrantFor] = useState<string | null>(null);
  const [grantForm, setGrantForm] = useState({ pluginId: "", planId: "" });
  const [grantMsg, setGrantMsg] = useState<string | null>(null);

  // The full plugin fetch includes its plans; only fires once a plugin is picked.
  const { data: plugin, isFetching: plansLoading } = useAdminPlugin(form.pluginId);
  const plans = useMemo(() => (plugin?.plans ?? []).filter((p) => p.isActive), [plugin]);

  // Plans for the per-row "add plugin" grant form (its own plugin selection).
  const { data: grantPlugin, isFetching: grantPlansLoading } = useAdminPlugin(grantForm.pluginId);
  const grantPlans = useMemo(() => (grantPlugin?.plans ?? []).filter((p) => p.isActive), [grantPlugin]);

  const openGrant = (id: string) => {
    grant.reset();
    setGrantFor(grantFor === id ? null : id);
    setGrantForm({ pluginId: "", planId: "" });
    setGrantMsg(null);
  };

  const canSubmit =
    !!form.name.trim() && !!form.email.trim() && form.password.length >= 6 && !!form.planId && !provision.isPending;

  const submit = () => {
    setError(null);
    setResult(null);
    provision.mutate(
      { name: form.name.trim(), email: form.email.trim(), password: form.password, planId: form.planId },
      {
        onSuccess: (data) => {
          setResult({ email: data.user.email, licenseKey: data.license.licenseKey });
          setForm({ name: "", email: "", password: "", pluginId: "", planId: "" });
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Failed to provision customer";
          setError(msg);
        },
      },
    );
  };

  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard?.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be unavailable */
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-8 py-4">
        <h1 className="font-display text-base font-bold">Customers</h1>
      </div>

      <div className="p-8 max-w-3xl flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          Create a client account and grant them a plugin directly — no PayPal checkout, and{" "}
          <strong>no email is ever sent</strong> to the client (now or for any future cancel/refund/renewal).
        </p>

        {/* Provision form */}
        <div className="card-surface p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-8 h-8 rounded-lg bg-primary/10 grid place-items-center">
              <UserPlus className="w-4 h-4 text-primary" />
            </span>
            <div>
              <p className="text-sm font-semibold">New customer + grant plugin</p>
              <p className="text-xs text-muted-foreground">The account can sign in with this email &amp; password immediately.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} placeholder="Client name" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inp}
                placeholder="client@example.com"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Password (min 6 — you set it)</label>
              <input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inp}
                placeholder="set a password to hand over"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Plugin</label>
              <select
                value={form.pluginId}
                onChange={(e) => setForm({ ...form, pluginId: e.target.value, planId: "" })}
                className={inp}
              >
                <option value="">Select a plugin…</option>
                {plugins.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground">Plan</label>
              <select
                value={form.planId}
                onChange={(e) => setForm({ ...form, planId: e.target.value })}
                disabled={!form.pluginId || plansLoading}
                className={inp}
              >
                <option value="">
                  {!form.pluginId ? "Select a plugin first" : plansLoading ? "Loading plans…" : "Select a plan…"}
                </option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {planLabel(p)}
                  </option>
                ))}
              </select>
              {form.pluginId && !plansLoading && plans.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">This plugin has no active plans.</p>
              )}
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="btn-ruby px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {provision.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Provisioning…
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create &amp; grant
                </>
              )}
            </button>
            <span className="text-xs text-muted-foreground">No email will be sent.</span>
          </div>
        </div>

        {/* Success: license key to hand over */}
        {result && (
          <div className="card-surface p-5 border border-green-500/30 bg-green-500/5">
            <div className="flex items-center gap-2 text-green-700 text-sm font-semibold mb-2">
              <Check className="w-4 h-4" /> Provisioned {result.email}
            </div>
            <p className="text-xs text-muted-foreground mb-2">License key (hand this to the client):</p>
            <div className="flex items-center gap-2">
              <code className="px-3 py-1.5 rounded-lg bg-muted text-sm font-mono">{result.licenseKey}</code>
              <button
                onClick={() => copyKey(result.licenseKey)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                title="Copy license key"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Managed customers list */}
        <div className="card-surface p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-8 h-8 rounded-lg bg-primary/10 grid place-items-center">
              <Users className="w-4 h-4 text-primary" />
            </span>
            <p className="text-sm font-semibold">Managed customers</p>
          </div>
          {enabledMsg && (
            <div className="mb-3 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2 text-xs text-green-700">
              {enabledMsg}
            </div>
          )}
          {grantMsg && (
            <div className="mb-3 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2 text-xs text-green-700">
              {grantMsg}
            </div>
          )}
          {customersLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : customers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No managed customers yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {customers.map((c) => (
                <div key={c.id} className="py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <button
                          onClick={() =>
                            setEmails.mutate(
                              { id: c.id, suppressEmails: false },
                              {
                                onSuccess: () =>
                                  setEnabledMsg(
                                    `Emails enabled for ${c.email}. They now receive emails like a normal customer and have left this list.`,
                                  ),
                              },
                            )
                          }
                          disabled={setEmails.isPending}
                          title="Turn email delivery on for this account (it becomes a normal customer)"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline disabled:opacity-50"
                        >
                          {setEmails.isPending && setEmails.variables?.id === c.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Mail className="w-3 h-3" />
                          )}
                          Emails off · Allow emails
                        </button>
                        <button
                          onClick={() => openGrant(c.id)}
                          title="Grant another plugin to this customer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                        >
                          <Plus className="w-3 h-3" />
                          Add plugin
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {c.licenses.length === 0 ? (
                        <span className="text-xs text-muted-foreground">No license</span>
                      ) : (
                        c.licenses.map((l) => (
                          <span key={l.id} className="inline-flex items-center gap-1.5 text-xs">
                            <KeyRound className="w-3 h-3 text-primary shrink-0" />
                            <span className="font-medium">{l.plugin.name}</span>
                            <span className="text-muted-foreground">· {l.plan.name}</span>
                            <code className="font-mono text-[11px] text-muted-foreground">{l.licenseKey}</code>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Inline "add another plugin" grant form for this customer */}
                  {grantFor === c.id && (
                    <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
                      <div className="grid sm:grid-cols-2 gap-2">
                        <select
                          value={grantForm.pluginId}
                          onChange={(e) => setGrantForm({ pluginId: e.target.value, planId: "" })}
                          className={inp}
                        >
                          <option value="">Select a plugin…</option>
                          {plugins.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <select
                          value={grantForm.planId}
                          onChange={(e) => setGrantForm({ ...grantForm, planId: e.target.value })}
                          disabled={!grantForm.pluginId || grantPlansLoading}
                          className={inp}
                        >
                          <option value="">
                            {!grantForm.pluginId
                              ? "Select a plugin first"
                              : grantPlansLoading
                                ? "Loading plans…"
                                : "Select a plan…"}
                          </option>
                          {grantPlans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {planLabel(p)}
                            </option>
                          ))}
                        </select>
                      </div>
                      {grant.isError && (
                        <p className="mt-2 text-xs text-destructive">Failed to grant — please try again.</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() =>
                            grant.mutate(
                              { userId: c.id, planId: grantForm.planId },
                              {
                                onSuccess: () => {
                                  setGrantMsg(`Plugin granted to ${c.email}.`);
                                  setGrantFor(null);
                                  setGrantForm({ pluginId: "", planId: "" });
                                },
                              },
                            )
                          }
                          disabled={!grantForm.planId || grant.isPending}
                          className="btn-ruby px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                          {grant.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                          Grant
                        </button>
                        <button
                          onClick={() => setGrantFor(null)}
                          className="px-3 py-1.5 rounded-lg text-xs border border-border hover:bg-muted transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
