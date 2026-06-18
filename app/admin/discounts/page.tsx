"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Check, Tag, Sparkles, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useDiscountSettings, useUpdateDiscountSettings } from "@/lib/hooks/discount.hooks";

type Form = { globalPercent: string; globalDays: string; newUserPercent: string; newUserDays: string };

const DAY_MS = 86_400_000;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

// Whole days remaining until the campaign ends (null = no end date).
const daysLeft = (endsAt: string | null) =>
  endsAt ? Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / DAY_MS)) : null;

export default function DiscountsPage() {
  const { data: settings, isLoading, error } = useDiscountSettings();
  const update = useUpdateDiscountSettings();

  const [form, setForm] = useState<Form | null>(null);
  const [saved, setSaved] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (settings && !form) {
      // Prefill the duration with the remaining days of an active campaign; 0 otherwise.
      const stillActive = settings.globalEndsAt && new Date(settings.globalEndsAt).getTime() > Date.now();
      setForm({
        globalPercent: String(settings.globalPercent),
        globalDays: String(stillActive ? daysLeft(settings.globalEndsAt) : 0),
        newUserPercent: String(settings.newUserPercent),
        newUserDays: String(settings.newUserDays),
      });
    }
  }, [settings]);

  const save = () => {
    if (!form) return;
    const g = Number(form.globalPercent), gd = Number(form.globalDays);
    const n = Number(form.newUserPercent), d = Number(form.newUserDays);
    if ([g, n].some((v) => v < 0 || v > 90) || d < 0 || gd < 0) {
      setApiError("Percents must be 0–90 and days must be 0 or more");
      return;
    }
    setApiError(null);
    update.mutate(
      { globalPercent: g, globalDays: gd, newUserPercent: n, newUserDays: d },
      {
        onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); },
        onError: (err: any) => setApiError(err?.response?.data?.message || "Save failed"),
      },
    );
  };

  if (isLoading || !form || !settings) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-sm text-destructive">Failed to load discount settings.</div>;
  }

  const inp = "mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary";

  // Live status of the currently SAVED global campaign.
  const gPercent = settings.globalPercent;
  const gEndsAt = settings.globalEndsAt;
  const gFuture = !!gEndsAt && new Date(gEndsAt).getTime() > Date.now();
  const gLeft = daysLeft(gEndsAt);

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-8 py-4 flex items-center justify-between gap-4">
        <h1 className="font-display text-base font-bold">Discounts</h1>
        <div className="flex items-center gap-3">
          {apiError && <p className="text-xs text-destructive">{apiError}</p>}
          <button
            onClick={save}
            disabled={update.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shrink-0 transition-all disabled:opacity-60 ${saved ? "bg-green-500 text-white" : "btn-ruby"}`}
          >
            {update.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : saved ? <><Check className="w-4 h-4" />Saved</> : <><Save className="w-4 h-4" />Save Changes</>}
          </button>
        </div>
      </div>

      <div className="p-8 max-w-xl flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          Store-wide discounts. When several discounts apply to a plan, the customer always gets the single largest one (they don&apos;t stack).
        </p>

        <div className="card-surface p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 grid place-items-center"><Tag className="w-4 h-4 text-primary" /></span>
            <div>
              <p className="text-sm font-semibold">Global discount</p>
              <p className="text-xs text-muted-foreground">Applied to every plan in the store, for a limited time.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Percent off (0–90)</label>
              <input type="number" min={0} max={90} value={form.globalPercent} onChange={(e) => setForm({ ...form, globalPercent: e.target.value })} className={inp} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Active for (days · 0 = no end)</label>
              <input type="number" min={0} value={form.globalDays} onChange={(e) => setForm({ ...form, globalDays: e.target.value })} className={inp} />
            </div>
          </div>
          <div className="mt-3">
            {gPercent <= 0 ? (
              <StatusPill tone="muted" icon={Clock} text="No global discount running" />
            ) : !gEndsAt ? (
              <StatusPill tone="green" icon={CheckCircle2} text={`Active · ${gPercent}% off · no end date`} />
            ) : gFuture ? (
              <StatusPill tone="green" icon={CheckCircle2} text={`Active · ${gPercent}% off · ${gLeft} day${gLeft === 1 ? "" : "s"} left · ends ${fmtDate(gEndsAt)}`} />
            ) : (
              <StatusPill tone="red" icon={AlertTriangle} text={`Expired on ${fmtDate(gEndsAt)} · not applied`} />
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Saving starts the campaign now and runs it for the days above. Set days to 0 for an always-on discount.
          </p>
        </div>

        <div className="card-surface p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 grid place-items-center"><Sparkles className="w-4 h-4 text-primary" /></span>
            <div>
              <p className="text-sm font-semibold">New-user welcome discount</p>
              <p className="text-xs text-muted-foreground">Applied for a window after a user signs up, then expires automatically.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Percent off (0–90)</label>
              <input type="number" min={0} max={90} value={form.newUserPercent} onChange={(e) => setForm({ ...form, newUserPercent: e.target.value })} className={inp} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Active for (days after signup)</label>
              <input type="number" min={0} value={form.newUserDays} onChange={(e) => setForm({ ...form, newUserDays: e.target.value })} className={inp} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({
  tone,
  icon: Icon,
  text,
}: {
  tone: "green" | "red" | "muted";
  icon: typeof Clock;
  text: string;
}) {
  const cls =
    tone === "green"
      ? "bg-emerald-500/10 text-emerald-700"
      : tone === "red"
        ? "bg-red-500/10 text-red-700"
        : "bg-muted text-muted-foreground";
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {text}
    </div>
  );
}
