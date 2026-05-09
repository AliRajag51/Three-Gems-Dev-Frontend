import { CheckCircle2, RefreshCw, Bell, TrendingUp } from "lucide-react";

export function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-gradient-to-tr from-primary/15 via-transparent to-primary-deep/10 rounded-3xl blur-2xl" />
      <div className="relative card-surface p-5 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">threegems.dashboard</span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Active Sites" value="1,284" trend="+12%" />
          <Stat label="Auto Workflows" value="9,302" trend="+38%" />
          <Stat label="Revenue Saved" value="$48.2k" trend="+22%" />
        </div>

        <div className="mt-5 space-y-3">
          <PluginRow emoji="💳" name="Payment Automation" status="Active" version="2.4.1" />
          <PluginRow emoji="🛒" name="Checkout Enhancer" status="Update" version="3.1.2" warn />
          <PluginRow emoji="🔑" name="License Manager Pro" status="Active" version="2.2.0" />
        </div>

        <div className="mt-5 rounded-xl bg-primary-soft p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-white grid place-items-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary-deep">142 orders auto-processed today</p>
            <p className="text-xs text-primary-deep/70 mt-0.5">Workflow “VIP fast-track” saved 3h 12m of admin work.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-3">
      <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
      <p className="mt-1 font-display text-lg font-bold leading-none">{value}</p>
      <p className="mt-1.5 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
        <TrendingUp className="w-3 h-3" /> {trend}
      </p>
    </div>
  );
}

function PluginRow({ emoji, name, status, version, warn }: { emoji: string; name: string; status: string; version: string; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary-soft grid place-items-center text-lg">{emoji}</div>
        <div>
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-[11px] text-muted-foreground">v{version} · Licensed</p>
        </div>
      </div>
      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${warn ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
        {warn ? <RefreshCw className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
        {status}
      </span>
    </div>
  );
}
