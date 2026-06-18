"use client";

import { useState } from "react";
import { Globe, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { usePluginCountryAnalytics } from "@/lib/hooks/admin.hooks";
import { countryName, flagEmoji } from "@/lib/countries";

// Collapsible per-plan country breakdown shown at the bottom of the Plans tab.
// Data is only fetched once the admin opens it. For each plan: "active" = currently
// active subscriptions; "total" = everyone who ever bought it (real subscriptions +
// completed orders). One-time plans show only the total (they have no subscriptions).
export function PlanCountryAnalytics({ pluginId }: { pluginId: string }) {
  const [open, setOpen] = useState(false);
  const { data: plans, isLoading } = usePluginCountryAnalytics(pluginId, open);

  return (
    <div className="mt-8 rounded-xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Globe className="w-4 h-4 text-primary" />
          Country analytics
          <span className="text-xs font-normal text-muted-foreground">per plan — subscribers &amp; total buyers</span>
        </span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border p-4">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : !plans || plans.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No plans yet.</p>
          ) : (
            <div className="space-y-6">
              {plans.map((plan) => {
                const recurring = plan.billingType === "RECURRING";
                return (
                  <div key={plan.planId}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        {plan.planName}
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {recurring ? "Subscription" : "One-time"}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {recurring && <><span className="font-semibold text-foreground">{plan.totals.active}</span> active · </>}
                        <span className="font-semibold text-foreground">{plan.totals.total}</span> total
                      </span>
                    </div>

                    {plan.countries.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No purchases yet.</p>
                    ) : (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-muted/40 text-muted-foreground">
                              <th className="py-2 px-3 text-left font-semibold">Country</th>
                              {recurring && <th className="py-2 px-3 text-right font-semibold">Active</th>}
                              <th className="py-2 px-3 text-right font-semibold">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {plan.countries.map((c) => (
                              <tr key={c.country ?? "unknown"} className="border-t border-border">
                                <td className="py-2 px-3">
                                  <span className="inline-flex items-center gap-2">
                                    <span className="text-sm leading-none">{flagEmoji(c.country)}</span>
                                    <span className="font-medium">{countryName(c.country)}</span>
                                    {c.country && <span className="text-[10px] text-muted-foreground">{c.country}</span>}
                                  </span>
                                </td>
                                {recurring && <td className="py-2 px-3 text-right tabular-nums">{c.active}</td>}
                                <td className="py-2 px-3 text-right font-bold tabular-nums">{c.total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
