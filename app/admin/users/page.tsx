"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, KeyRound, RefreshCw, ShoppingBag, Search, Shield, BellOff, Copy, Check } from "lucide-react";
import { useAdminUsers, useUpdateUser } from "@/lib/hooks/admin.hooks";
import { useAuth } from "@/lib/context/auth.context";
import type { AdminUserEntitlement } from "@/lib/services/admin.service";

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : null;

const isExpired = (l: AdminUserEntitlement) =>
  l.status === "EXPIRED" || (!!l.expiresAt && new Date(l.expiresAt) < new Date());

// Effective status pill for one entitlement.
function statusPill(l: AdminUserEntitlement): { label: string; cls: string } {
  if (isExpired(l)) return { label: "Expired", cls: "bg-muted text-muted-foreground" };
  if (l.subscription && (l.subscription.cancelAtPeriodEnd || l.subscription.status === "CANCELLED"))
    return { label: "Cancelling", cls: "bg-amber-500/10 text-amber-700" };
  if (l.status === "ACTIVE") return { label: "Active", cls: "bg-green-500/10 text-green-600" };
  return { label: l.status, cls: "bg-muted text-muted-foreground" };
}

// Human expiry/renewal line — recurring shows renew/end of the current period.
function expiryLine(l: AdminUserEntitlement): string {
  if (l.plan.billingType === "RECURRING" && l.subscription) {
    const end = fmtDate(l.subscription.currentPeriodEnd);
    if (!end) return "—";
    return l.subscription.cancelAtPeriodEnd || l.subscription.status === "CANCELLED" ? `Ends ${end}` : `Renews ${end}`;
  }
  const exp = fmtDate(l.expiresAt);
  return exp ? `Expires ${exp}` : "Lifetime";
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const [account, setAccount] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const filtered = !!debounced || account !== "all" || type !== "all" || status !== "all";

  const { data, isLoading, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useAdminUsers(debounced, {
    account,
    type,
    status,
  });
  const users = data?.pages.flatMap((p) => p.users) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const selCls = "px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-primary";

  const { user: me } = useAuth();
  const updateUser = useUpdateUser();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard?.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch {
      /* clipboard may be unavailable */
    }
  };

  // Infinite scroll — load the next page when the sentinel scrolls into view.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-8 py-4 flex items-center justify-between">
        <h1 className="font-display text-base font-bold">Users</h1>
        {!isLoading && (
          <span className="text-xs text-muted-foreground">
            {total} {filtered ? `result${total === 1 ? "" : "s"}` : "with a plan"}
          </span>
        )}
      </div>

      <div className="p-8 max-w-3xl flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Everyone who owns a plugin — purchase, subscription, or admin grant — with their plan, type and expiry.
          Loaded 20 at a time; scroll down for more.
        </p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users by name or email…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
          />
          {isFetching && !isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <select value={account} onChange={(e) => setAccount(e.target.value)} className={selCls} title="Account type">
            <option value="all">All accounts</option>
            <option value="customers">Customers</option>
            <option value="comp">Comp (no email)</option>
            <option value="admins">Admins</option>
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className={selCls} title="Plan type">
            <option value="all">All types</option>
            <option value="subscription">Subscriptions</option>
            <option value="onetime">One-time</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selCls} title="License status">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            {filtered ? "No users match your search/filters." : "No users with a plan yet."}
          </p>
        ) : (
          <>
            {users.map((u) => (
              <div key={u.id} className="card-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => updateUser.mutate({ id: u.id, data: { isAdmin: !u.isAdmin } })}
                        disabled={updateUser.isPending || (u.id === me?.id && u.isAdmin)}
                        title={u.id === me?.id && u.isAdmin ? "You can't remove your own admin access" : u.isAdmin ? "Remove admin" : "Make admin"}
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed ${
                          u.isAdmin ? "bg-primary text-white border-primary" : "text-primary border-primary/40 hover:bg-primary-soft"
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {u.isAdmin ? "Admin" : "Make admin"}
                      </button>
                      <button
                        onClick={() => updateUser.mutate({ id: u.id, data: { suppressEmails: !u.suppressEmails } })}
                        disabled={updateUser.isPending}
                        title={u.suppressEmails ? "Allow emails to this account" : "Stop all emails to this account"}
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed ${
                          u.suppressEmails ? "bg-amber-500 text-white border-amber-500" : "text-amber-700 border-amber-500/50 hover:bg-amber-500/10"
                        }`}
                      >
                        <BellOff className="w-3 h-3" />
                        {u.suppressEmails ? "No emails" : "Mute emails"}
                      </button>
                      {updateUser.isPending && updateUser.variables?.id === u.id && (
                        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">Joined {fmtDate(u.createdAt)}</span>
                </div>

                <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                  {u.licenses.map((l) => {
                    const pill = statusPill(l);
                    return (
                      <div key={l.id} className="text-xs">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex items-center gap-2">
                            <KeyRound className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="font-medium truncate">{l.plugin.name}</span>
                            <span className="text-muted-foreground truncate">· {l.plan.name}</span>
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                              {l.plan.billingType === "RECURRING" ? <RefreshCw className="w-2.5 h-2.5" /> : <ShoppingBag className="w-2.5 h-2.5" />}
                              {l.plan.billingType === "RECURRING" ? "Subscription" : "One-time"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${pill.cls}`}>{pill.label}</span>
                            <span className="text-muted-foreground whitespace-nowrap">{expiryLine(l)}</span>
                          </div>
                        </div>
                        <div className="mt-1 ml-[22px] flex items-center gap-1.5">
                          <code className="font-mono text-[11px] text-muted-foreground">{l.licenseKey}</code>
                          <button
                            onClick={() => copyKey(l.licenseKey)}
                            className="p-0.5 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Copy activation key"
                          >
                            {copiedKey === l.licenseKey ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div ref={sentinelRef} className="py-4 flex justify-center">
              {isFetchingNextPage ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : hasNextPage ? (
                <span className="text-xs text-muted-foreground">Scroll for more…</span>
              ) : (
                <span className="text-xs text-muted-foreground">All {total} users shown</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
