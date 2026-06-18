"use client";

import { useState } from "react";
import { Loader2, Mail, MailOpen, CheckCircle2, Reply } from "lucide-react";
import { useContactMessages, useUpdateContactMessage } from "@/lib/hooks/contact.hooks";
import type { ContactStatus } from "@/lib/services/contact.service";

const SUBJECT_LABEL: Record<string, string> = {
  SALES: "Sales inquiry",
  AGENCY: "Agency / bundle pricing",
  PARTNERSHIP: "Partnership",
  OTHER: "Other",
};

const STATUS_STYLE: Record<ContactStatus, string> = {
  NEW: "bg-amber-500/15 text-amber-700",
  READ: "bg-blue-500/15 text-blue-700",
  REPLIED: "bg-emerald-500/15 text-emerald-700",
};

export default function AdminContactPage() {
  const [filter, setFilter] = useState<ContactStatus | undefined>(undefined);
  const { data, isLoading } = useContactMessages(filter);
  const update = useUpdateContactMessage();

  const messages = data?.messages ?? [];

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
      active ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:border-primary/40"
    }`;

  return (
    <div className="p-5 lg:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Contact messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data ? `${data.newCount} new` : "Sales & partnership inquiries"}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter(undefined)} className={pill(!filter)}>All</button>
          <button onClick={() => setFilter("NEW")} className={pill(filter === "NEW")}>New</button>
          <button onClick={() => setFilter("READ")} className={pill(filter === "READ")}>Read</button>
          <button onClick={() => setFilter("REPLIED")} className={pill(filter === "REPLIED")}>Replied</button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : messages.length === 0 ? (
        <div className="card-surface p-10 text-center text-sm text-muted-foreground">
          <Mail className="w-8 h-8 mx-auto mb-3 text-muted-foreground/60" />
          No messages {filter ? `(${filter.toLowerCase()})` : "yet"}.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="card-surface p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {SUBJECT_LABEL[m.subject] ?? m.subject}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[m.status]}`}>
                      {m.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">
                    {m.name} · <span className="font-normal text-muted-foreground">{m.email}</span>
                  </p>
                  {m.company && <p className="text-xs text-muted-foreground mt-0.5">{m.company}</p>}
                  <p className="mt-2 text-sm whitespace-pre-wrap">{m.message}</p>
                </div>

                <div className="flex flex-col items-stretch gap-2 shrink-0">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (SUBJECT_LABEL[m.subject] ?? "your message"))}`}
                    onClick={() => m.status === "NEW" && update.mutate({ id: m.id, status: "READ" })}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-deep transition-colors"
                  >
                    <Reply className="w-3.5 h-3.5" /> Reply
                  </a>
                  {m.status !== "REPLIED" ? (
                    <button
                      onClick={() => update.mutate({ id: m.id, status: "REPLIED" })}
                      disabled={update.isPending}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:border-primary/40 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Mark replied
                    </button>
                  ) : (
                    <button
                      onClick={() => update.mutate({ id: m.id, status: "READ" })}
                      disabled={update.isPending}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:border-primary/40 disabled:opacity-50 transition-colors"
                    >
                      <MailOpen className="w-3.5 h-3.5" /> Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
