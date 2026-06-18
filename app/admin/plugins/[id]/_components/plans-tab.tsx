"use client";

import { Fragment, useState } from "react";
import { Plus, Trash2, Pencil, ToggleLeft, ToggleRight, Loader2, UserX } from "lucide-react";
import { useMutation, useQueryClient, useIsFetching } from "@tanstack/react-query";
import * as adminService from "@/lib/services/admin.service";
import type { AdminPlugin } from "@/lib/types/admin";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { EmailPicker } from "@/components/admin/email-picker";
import { effectivePlanDiscount, planDiscountStatus } from "@/lib/pricing";
import { PlanCountryAnalytics } from "./plan-country-analytics";

const SITE_OPTIONS = [
  { label: "1 site",   value: 1 },
  { label: "2 sites",  value: 2 },
  { label: "3 sites",  value: 3 },
  { label: "5 sites",  value: 5 },
  { label: "10 sites", value: 10 },
  { label: "25 sites", value: 25 },
  { label: "Unlimited", value: 0 },
] as const;

const DURATION_OPTIONS = [
  { label: "1 month",  value: 30 },
  { label: "2 months", value: 60 },
  { label: "3 months", value: 90 },
  { label: "6 months", value: 180 },
  { label: "1 year",   value: 365 },
  { label: "2 years",  value: 730 },
  { label: "Lifetime", value: 0 },
] as const;

const siteLabel = (n: number) =>
  SITE_OPTIONS.find((o) => o.value === n)?.label ?? `${n} sites`;
const durationLabel = (n: number) =>
  DURATION_OPTIONS.find((o) => o.value === n)?.label ?? `${n} days`;

const INTERVAL_UNIT_OPTIONS = [
  { label: "Day(s)", value: "DAY" },
  { label: "Week(s)", value: "WEEK" },
  { label: "Month(s)", value: "MONTH" },
  { label: "Year(s)", value: "YEAR" },
] as const;

type PlanForm = {
  name: string;
  siteLimit: number;
  durationDays: number;
  priceUsd: string;
  discountPercent: string;
  discountDurationDays: string;
  isActive: boolean;
  billingType: "ONCE" | "RECURRING";
  billingIntervalUnit: string;
  billingIntervalCount: string;
  isPublic: boolean;
  allowedEmails: string[];
};

const DEFAULT_FORM: PlanForm = {
  name: "", siteLimit: 1, durationDays: 365, priceUsd: "1", discountPercent: "0", discountDurationDays: "0", isActive: true,
  billingType: "ONCE", billingIntervalUnit: "MONTH", billingIntervalCount: "1",
  isPublic: true, allowedEmails: [],
};

export function PlansTab({ plugin, pluginId }: { plugin: AdminPlugin; pluginId: string }) {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-plugin", pluginId] });
  // True while the plugin (and its plans) is refetching after a mutation — used to
  // show an "Updating…" indicator so a change clearly reflects without a manual reload.
  const refreshing = useIsFetching({ queryKey: ["admin-plugin", pluginId] }) > 0;

  const [addForm, setAddForm] = useState<PlanForm | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PlanForm>(DEFAULT_FORM);
  const [apiError, setApiError] = useState<string | null>(null);

  const addPlan = useMutation({
    mutationFn: (d: PlanForm) => adminService.addPlan(pluginId, {
      name: d.name.trim(), siteLimit: d.siteLimit, durationDays: d.durationDays,
      priceUsd: Number(d.priceUsd), discountPercent: Number(d.discountPercent),
      discountDurationDays: Number(d.discountDurationDays) || 0, isActive: d.isActive,
      billingType: d.billingType,
      isPublic: d.isPublic, allowedEmails: d.allowedEmails,
      ...(d.billingType === "RECURRING" && {
        billingIntervalUnit: d.billingIntervalUnit,
        billingIntervalCount: Number(d.billingIntervalCount),
      }),
    }),
    onSuccess: () => { invalidate(); setAddForm(null); },
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to add plan"),
  });

  const updatePlan = useMutation({
    mutationFn: ({ planId, d }: { planId: string; d: PlanForm }) => adminService.updatePlan(planId, {
      name: d.name.trim(), siteLimit: d.siteLimit, durationDays: d.durationDays,
      priceUsd: Number(d.priceUsd), discountPercent: Number(d.discountPercent),
      discountDurationDays: Number(d.discountDurationDays) || 0, isActive: d.isActive,
      isPublic: d.isPublic, allowedEmails: d.allowedEmails,
    }),
    onSuccess: () => { invalidate(); setEditId(null); },
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to update plan"),
  });

  const deletePlan = useMutation({
    mutationFn: adminService.deletePlan,
    onSuccess: invalidate,
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to delete plan"),
  });

  const toggleActive = useMutation({
    mutationFn: ({ planId, isActive }: { planId: string; isActive: boolean }) => adminService.updatePlan(planId, { isActive }),
    onSuccess: invalidate,
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to update plan status"),
  });

  // Separate from deactivate: cancels every active subscription on the plan.
  const cancelSubs = useMutation({
    mutationFn: (planId: string) => adminService.cancelPlanSubscriptions(planId),
    onSuccess: invalidate,
    onError: (err: any) => setApiError(err?.response?.data?.message || "Failed to cancel subscriptions"),
  });

  const inp = "w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary";
  const busy = addPlan.isPending || updatePlan.isPending || deletePlan.isPending || toggleActive.isPending || cancelSubs.isPending;

  // If the current value isn't in the preset list (legacy data), prepend a "Custom (X)" entry so it stays selectable.
  const sitesOptionsFor = (current: number) => {
    if (SITE_OPTIONS.some((o) => o.value === current)) return SITE_OPTIONS as readonly { label: string; value: number }[];
    return [{ label: `Custom (${current === 0 ? "Unlimited" : current})`, value: current }, ...SITE_OPTIONS];
  };
  const durationOptionsFor = (current: number) => {
    if (DURATION_OPTIONS.some((o) => o.value === current)) return DURATION_OPTIONS as readonly { label: string; value: number }[];
    return [{ label: `Custom (${current === 0 ? "Lifetime" : `${current}d`})`, value: current }, ...DURATION_OPTIONS];
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          {plugin.plans.length} plan{plugin.plans.length !== 1 ? "s" : ""}
          {refreshing && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              <Loader2 className="w-3 h-3 animate-spin" /> Updating…
            </span>
          )}
        </p>
        {!addForm && (
          <button onClick={() => { setAddForm({ ...DEFAULT_FORM }); setApiError(null); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary/30 text-primary hover:bg-primary-soft transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Plan
          </button>
        )}
      </div>

      {apiError && <p className="mb-3 text-xs text-destructive">{apiError}</p>}

      {addForm && (
        <div className="mb-4 p-4 rounded-xl border border-primary/20 bg-primary-soft/20">
          <p className="text-sm font-semibold mb-3">New Plan</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
            <div className="col-span-2 sm:col-span-1"><label className="text-xs text-muted-foreground">Name</label><input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="Single Site" className={`mt-1 ${inp}`} /></div>
            <div>
              <label className="text-xs text-muted-foreground">Sites</label>
              <select value={addForm.siteLimit} onChange={(e) => setAddForm({ ...addForm, siteLimit: Number(e.target.value) })} className={`mt-1 ${inp}`}>
                {sitesOptionsFor(addForm.siteLimit).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Billing</label>
              <select value={addForm.billingType} onChange={(e) => setAddForm({ ...addForm, billingType: e.target.value as "ONCE" | "RECURRING" })} className={`mt-1 ${inp}`}>
                <option value="ONCE">One-time</option>
                <option value="RECURRING">Recurring</option>
              </select>
            </div>
            {addForm.billingType === "ONCE" ? (
              <div>
                <label className="text-xs text-muted-foreground">Duration</label>
                <select value={addForm.durationDays} onChange={(e) => setAddForm({ ...addForm, durationDays: Number(e.target.value) })} className={`mt-1 ${inp}`}>
                  {durationOptionsFor(addForm.durationDays).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Every</label>
                  <input type="number" min={1} value={addForm.billingIntervalCount} onChange={(e) => setAddForm({ ...addForm, billingIntervalCount: e.target.value })} className={`mt-1 ${inp}`} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Unit</label>
                  <select value={addForm.billingIntervalUnit} onChange={(e) => setAddForm({ ...addForm, billingIntervalUnit: e.target.value })} className={`mt-1 ${inp}`}>
                    {INTERVAL_UNIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            )}
            <div><label className="text-xs text-muted-foreground">Price (USD)</label><input type="number" min={1} step={0.01} value={addForm.priceUsd} onChange={(e) => setAddForm({ ...addForm, priceUsd: e.target.value })} className={`mt-1 ${inp}`} /></div>
            <div><label className="text-xs text-muted-foreground">Discount %</label><input type="number" min={0} max={90} value={addForm.discountPercent} onChange={(e) => setAddForm({ ...addForm, discountPercent: e.target.value })} className={`mt-1 ${inp}`} /></div>
            <div>
              <label className="text-xs text-muted-foreground">Discount lasts (days)</label>
              <input type="number" min={0} max={3650} value={addForm.discountDurationDays} onChange={(e) => setAddForm({ ...addForm, discountDurationDays: e.target.value })} placeholder="0 = no expiry" className={`mt-1 ${inp}`} />
              <p className="mt-1 text-[10px] text-muted-foreground">0 = never expires. e.g. 60 → discount auto-removes after 60 days.</p>
            </div>
          </div>

          {/* Visibility */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs mb-2">
            <input type="checkbox" checked={!addForm.isPublic} onChange={(e) => setAddForm({ ...addForm, isPublic: !e.target.checked })} className="accent-primary" />
            Private plan (only specific users can see &amp; buy it)
          </label>
          {!addForm.isPublic && (
            <div className="mb-3 max-w-md">
              <EmailPicker value={addForm.allowedEmails} onChange={(emails) => setAddForm({ ...addForm, allowedEmails: emails })} />
            </div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={() => addPlan.mutate(addForm)} disabled={!addForm.name.trim() || Number(addForm.priceUsd) < 1 || busy} className="btn-ruby px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5">
              {addPlan.isPending && <Loader2 className="w-3 h-3 animate-spin" />}Save
            </button>
            <button onClick={() => setAddForm(null)} className="px-4 py-1.5 rounded-lg text-xs border border-border hover:bg-muted transition-colors">Cancel</button>
            <label className="flex items-center gap-1.5 cursor-pointer ml-auto text-xs"><input type="checkbox" checked={addForm.isActive} onChange={(e) => setAddForm({ ...addForm, isActive: e.target.checked })} className="accent-primary" />Active</label>
          </div>
        </div>
      )}

      {plugin.plans.length === 0 && !addForm && <p className="text-sm text-muted-foreground py-8 text-center">No plans yet.</p>}

      {plugin.plans.length > 0 && (
        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/40"><th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Name</th><th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Sites</th><th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Billing</th><th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Price</th><th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Discount</th><th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Status</th><th /></tr></thead>
            <tbody>
              {plugin.plans.map((plan, i) => {
                if (editId === plan.id) return (
                  <Fragment key={plan.id}>
                  <tr className="bg-primary-soft/10">
                    <td className="px-2 py-2"><input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inp} /></td>
                    <td className="px-2 py-2">
                      <select value={editForm.siteLimit} onChange={(e) => setEditForm({ ...editForm, siteLimit: Number(e.target.value) })} className={`w-28 ${inp}`}>
                        {sitesOptionsFor(editForm.siteLimit).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select value={editForm.durationDays} onChange={(e) => setEditForm({ ...editForm, durationDays: Number(e.target.value) })} className={`w-28 ${inp}`}>
                        {durationOptionsFor(editForm.durationDays).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2"><input type="number" min={1} step={0.01} value={editForm.priceUsd} onChange={(e) => setEditForm({ ...editForm, priceUsd: e.target.value })} className={`w-24 ${inp}`} /></td>
                    <td className="px-2 py-2">
                      <input type="number" min={0} max={90} value={editForm.discountPercent} onChange={(e) => setEditForm({ ...editForm, discountPercent: e.target.value })} className={`w-20 ${inp}`} title="Discount %" placeholder="%" />
                      <input type="number" min={0} max={3650} value={editForm.discountDurationDays} onChange={(e) => setEditForm({ ...editForm, discountDurationDays: e.target.value })} className={`w-20 mt-1 ${inp}`} title="Discount lasts (days) — 0 = no expiry" placeholder="days" />
                    </td>
                    <td className="px-2 py-2"><label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} className="accent-primary" />Active</label></td>
                    <td className="px-2 py-2"><div className="flex gap-1">
                      <button onClick={() => updatePlan.mutate({ planId: plan.id, d: editForm })} disabled={!editForm.name.trim() || Number(editForm.priceUsd) < 1 || busy} className="btn-ruby px-2.5 py-1 rounded-md text-xs font-semibold disabled:opacity-50 flex items-center gap-1">
                        {updatePlan.isPending && <Loader2 className="w-3 h-3 animate-spin" />}Save
                      </button>
                      <button onClick={() => setEditId(null)} className="px-2.5 py-1 rounded-md text-xs border border-border hover:bg-muted">Cancel</button>
                    </div></td>
                  </tr>
                  <tr className="border-b border-border bg-primary-soft/10">
                    <td colSpan={7} className="px-2 pb-3">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                        <input type="checkbox" checked={!editForm.isPublic} onChange={(e) => setEditForm({ ...editForm, isPublic: !e.target.checked })} className="accent-primary" />
                        Private plan (only specific users can see &amp; buy it)
                      </label>
                      {!editForm.isPublic && (
                        <div className="mt-2 max-w-md">
                          <EmailPicker value={editForm.allowedEmails} onChange={(emails) => setEditForm({ ...editForm, allowedEmails: emails })} />
                        </div>
                      )}
                    </td>
                  </tr>
                  </Fragment>
                );
                const activeSubs = plan.activeSubscriptions ?? 0;
                const effDiscount = effectivePlanDiscount(plan);
                const discStatus = planDiscountStatus(plan);
                return (
                  <tr key={plan.id} className={`${i < plugin.plans.length - 1 ? "border-b border-border" : ""} hover:bg-muted/20`}>
                    <td className="px-4 py-3 font-medium">
                      <span className="inline-flex items-center gap-2">
                        {plan.name}
                        {plan.isPublic === false && (
                          <button
                            type="button"
                            onClick={() => {
                              const emails = plan.allowedEmails ?? [];
                              confirm({
                                title: `Who can access "${plan.name}"`,
                                description:
                                  emails.length === 0 ? (
                                    <span className="text-muted-foreground">No users added yet — nobody can see or buy this plan.</span>
                                  ) : (
                                    <ul className="mt-1 max-h-60 overflow-auto text-left space-y-1">
                                      {emails.map((e) => (
                                        <li key={e} className="font-mono text-xs px-2 py-1 rounded bg-muted break-all">{e}</li>
                                      ))}
                                    </ul>
                                  ),
                                confirmLabel: "Close",
                                hideCancel: true,
                              });
                            }}
                            title="View who can access this plan"
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 transition-colors"
                          >
                            Private · {(plan.allowedEmails ?? []).length}
                          </button>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{siteLabel(plan.siteLimit)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {plan.billingType === "RECURRING" && plan.billingIntervalUnit
                        ? `Every ${plan.billingIntervalCount ?? 1} ${plan.billingIntervalUnit.toLowerCase()}(s)`
                        : durationLabel(plan.durationDays)}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {effDiscount > 0 ? (
                        <span className="flex items-center gap-2">
                          <span>${(Number(plan.priceUsd) * (1 - effDiscount / 100)).toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground line-through font-normal">${Number(plan.priceUsd).toFixed(2)}</span>
                        </span>
                      ) : (
                        `$${Number(plan.priceUsd).toFixed(2)}`
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {effDiscount > 0 ? (
                        <span className="inline-flex flex-col items-start gap-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">−{effDiscount}%</span>
                          {discStatus.isTimed && (
                            <span className="text-[10px] font-medium text-amber-600">
                              {discStatus.daysLeft === 0 ? "ends today" : `${discStatus.daysLeft}d left`}
                            </span>
                          )}
                        </span>
                      ) : plan.discountPercent > 0 && discStatus.expired ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">expired</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${plan.isActive ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>{plan.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {plan.billingType === "RECURRING" && (
                          <button
                            onClick={async () => {
                              const ok = await confirm({
                                title: "Unsubscribe all users?",
                                description: (
                                  <>
                                    This will <strong>cancel {activeSubs === 1 ? "the 1 active subscription" : `all ${activeSubs} active subscriptions`}</strong> on{" "}
                                    <strong>{plan.name}</strong>. Each user keeps access until their current period ends.
                                    The plan itself stays as-is (not deactivated). This can&apos;t be undone.
                                  </>
                                ),
                                confirmLabel: `Unsubscribe ${activeSubs}`,
                                cancelLabel: "Keep them",
                                tone: "danger",
                              });
                              if (ok) cancelSubs.mutate(plan.id);
                            }}
                            disabled={busy || activeSubs === 0}
                            title={activeSubs === 0 ? "No active subscribers" : `Cancel all ${activeSubs} subscription(s) on this plan`}
                            className="text-xs font-semibold px-2 py-1 rounded-md border border-destructive/40 text-destructive hover:bg-destructive/5 disabled:opacity-40 disabled:hover:bg-transparent inline-flex items-center gap-1"
                          >
                            {cancelSubs.isPending && cancelSubs.variables === plan.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <UserX className="w-3 h-3" />}
                            Unsub
                            <span className="ml-0.5 px-1.5 rounded-full bg-destructive/10 text-[10px] font-bold leading-4">{activeSubs}</span>
                          </button>
                        )}
                        <button
                          onClick={() => toggleActive.mutate({ planId: plan.id, isActive: !plan.isActive })}
                          disabled={busy}
                          title={plan.isActive ? "Deactivate plan" : "Activate plan"}
                          className="text-primary p-1 disabled:opacity-50"
                        >
                          {toggleActive.isPending && toggleActive.variables?.planId === plan.id
                            ? <Loader2 className="w-5 h-5 animate-spin" />
                            : plan.isActive
                              ? <ToggleRight className="w-5 h-5" />
                              : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                        </button>
                        <button onClick={() => { setEditId(plan.id); setEditForm({ name: plan.name, siteLimit: plan.siteLimit, durationDays: plan.durationDays, priceUsd: plan.priceUsd, discountPercent: String(plan.discountPercent ?? 0), discountDurationDays: String(plan.discountDurationDays ?? 0), isActive: plan.isActive, billingType: (plan.billingType ?? "ONCE") as "ONCE" | "RECURRING", billingIntervalUnit: plan.billingIntervalUnit ?? "MONTH", billingIntervalCount: String(plan.billingIntervalCount ?? 1), isPublic: plan.isPublic ?? true, allowedEmails: plan.allowedEmails ?? [] }); setApiError(null); }} disabled={busy} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deletePlan.mutate(plan.id)} disabled={busy} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Per-plan country analytics (subscribers + total buyers) — lazy-loaded. */}
      <PlanCountryAnalytics pluginId={pluginId} />
    </div>
  );
}
