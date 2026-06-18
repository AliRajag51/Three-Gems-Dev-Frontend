"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, RotateCcw, LifeBuoy } from "lucide-react";
import { useSupportTickets, useUpdateTicket } from "@/lib/hooks/support.hooks";
import type { SupportTicketStatus } from "@/lib/services/support.service";

const TYPE_LABEL: Record<string, string> = {
  PAYMENT: "Payment",
  PLUGIN: "Plugin",
  LICENSE: "License",
  ACCOUNT: "Account",
  OTHER: "Other",
};

export default function AdminSupportPage() {
  const [filter, setFilter] = useState<SupportTicketStatus | undefined>(undefined);
  const { data, isLoading } = useSupportTickets(filter);
  const update = useUpdateTicket();

  const tickets = data?.tickets ?? [];

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
      active ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:border-primary/40"
    }`;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Support tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data ? `${data.openCount} open` : "Customer problems & requests"}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter(undefined)} className={pill(!filter)}>All</button>
          <button onClick={() => setFilter("OPEN")} className={pill(filter === "OPEN")}>Open</button>
          <button onClick={() => setFilter("RESOLVED")} className={pill(filter === "RESOLVED")}>Resolved</button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="card-surface p-10 text-center text-sm text-muted-foreground">
          <LifeBuoy className="w-8 h-8 mx-auto mb-3 text-muted-foreground/60" />
          No tickets {filter ? `(${filter.toLowerCase()})` : "yet"}.
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="card-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {TYPE_LABEL[t.type] ?? t.type}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === "OPEN" ? "bg-amber-500/15 text-amber-700" : "bg-emerald-500/15 text-emerald-700"
                      }`}
                    >
                      {t.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">
                    {t.user?.name ?? "—"} · <span className="font-normal text-muted-foreground">{t.email}</span>
                  </p>
                  {t.licenseKey && <p className="text-xs font-mono text-muted-foreground mt-0.5">{t.licenseKey}</p>}
                  <p className="mt-2 text-sm whitespace-pre-wrap">{t.message}</p>
                </div>
                <button
                  onClick={() => update.mutate({ id: t.id, status: t.status === "OPEN" ? "RESOLVED" : "OPEN" })}
                  disabled={update.isPending}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:border-primary/40 disabled:opacity-50 transition-colors"
                >
                  {t.status === "OPEN" ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolve</>
                  ) : (
                    <><RotateCcw className="w-3.5 h-3.5" /> Reopen</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
