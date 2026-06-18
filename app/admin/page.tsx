"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Tag, Users, LifeBuoy, Plus, ArrowRight, Loader2, FlaskConical, CheckCircle2, AlertCircle } from "lucide-react";
import { useAdminPlugins, useCustomerCount, useCountryAnalytics } from "@/lib/hooks/admin.hooks";
import { useSupportTickets } from "@/lib/hooks/support.hooks";
import { countryName, flagEmoji } from "@/lib/countries";
import api from "@/lib/services";

export default function AdminDashboard() {
  const { data: plugins = [], isLoading } = useAdminPlugins();
  const { data: support } = useSupportTickets("OPEN");
  const { data: customerCount, isLoading: customersLoading } = useCustomerCount();
  const { data: countryStats = [], isLoading: countriesLoading } = useCountryAnalytics();
  const [testEmail, setTestEmail] = useState("");
  const [testSlug, setTestSlug] = useState("");
  const [testMinutes, setTestMinutes] = useState("5");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; expiresAt?: string } | null>(null);

  const handleShortenLicense = async () => {
    if (!testEmail || !testSlug) return;
    console.log(`[TEST] Setting license expiry for ${testEmail} / ${testSlug} to ${testMinutes} min`);
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await api.post("/admin/test/shorten-license", {
        email: testEmail,
        pluginSlug: testSlug,
        minutes: Number(testMinutes),
      });
      setTestResult({ ok: true, message: res.data.message, expiresAt: res.data.data.expiresAt });
    } catch (err: any) {
      setTestResult({ ok: false, message: err.response?.data?.message ?? "Request failed" });
    } finally {
      setTestLoading(false);
    }
  };

  const stats = [
    { label: "Total Plugins", value: isLoading ? "…" : plugins.length, icon: Package, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Active Plugins", value: isLoading ? "…" : plugins.filter((p) => p.isActive).length, icon: Package, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Total Plans", value: isLoading ? "…" : plugins.reduce((a, p) => a + p.planCount, 0), icon: Tag, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Customers", value: customersLoading ? "…" : (customerCount ?? "—"), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Open Tickets", value: support ? support.openCount : "…", icon: LifeBuoy, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here&apos;s an overview of your platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} ${s.color} grid place-items-center mb-3`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card-surface p-6">
          <h2 className="font-display text-base font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            {[
              { label: "Add New Plugin", href: "/admin/plugins/new", icon: Plus },
              { label: "Manage All Plugins", href: "/admin/plugins", icon: Package },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary-soft/30 transition-colors group"
              >
                <span className="flex items-center gap-2.5 text-sm font-medium">
                  <a.icon className="w-4 h-4 text-primary" />
                  {a.label}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-bold">Recent Plugins</h2>
            <Link href="/admin/plugins" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : plugins.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No plugins yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {plugins.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/plugins/${p.id}`}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:text-primary transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">v{p.version} · {p.planCount} plan{p.planCount !== 1 ? "s" : ""}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.isActive ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Buyers by country */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="font-display text-base font-bold">Buyers by country</h2>
          <span className="text-xs text-muted-foreground">Active subscriptions + completed orders</span>
        </div>
        {countriesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : countryStats.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No purchases yet.</p>
        ) : (
          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-muted-foreground">
                  <th className="py-2 pr-4 text-left">Country</th>
                  <th className="py-2 px-4 text-right">Subscribers</th>
                  <th className="py-2 px-4 text-right">Orders</th>
                  <th className="py-2 pl-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {countryStats.map((c) => (
                  <tr key={c.country ?? "unknown"} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-base leading-none">{flagEmoji(c.country)}</span>
                        <span className="font-medium">{countryName(c.country)}</span>
                        {c.country && <span className="text-xs text-muted-foreground">{c.country}</span>}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums">{c.activeSubscriptions}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums">{c.completedOrders}</td>
                    <td className="py-2.5 pl-4 text-right font-bold tabular-nums">{c.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Testing Tools */}
      <div className="card-surface p-6 mt-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 grid place-items-center">
            <FlaskConical className="w-4 h-4 text-yellow-600" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold">Testing Tools</h2>
            <p className="text-xs text-muted-foreground">Sandbox-only — shorten a license expiry to test renewal flows</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">User email</label>
            <input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="user@example.com"
              className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Plugin</label>
            <select
              value={testSlug}
              onChange={(e) => setTestSlug(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select plugin…</option>
              {plugins.map((p) => (
                <option key={p.id} value={p.slug}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Expires in (minutes)</label>
            <select
              value={testMinutes}
              onChange={(e) => setTestMinutes(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="1">1 minute</option>
              <option value="2">2 minutes</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
            </select>
          </div>
          <button
            onClick={handleShortenLicense}
            disabled={testLoading || !testEmail || !testSlug}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
            Set Expiry
          </button>
        </div>

        {testResult && (
          <div className={`mt-3 flex items-start gap-2 text-sm px-3 py-2.5 rounded-xl ${testResult.ok ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"}`}>
            {testResult.ok
              ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            <span>
              {testResult.message}
              {testResult.expiresAt && (
                <span className="ml-1 font-mono text-xs">
                  → {new Date(testResult.expiresAt).toLocaleTimeString()}
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
