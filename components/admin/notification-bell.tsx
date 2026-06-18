"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, LifeBuoy, Mail } from "lucide-react";
import { useAdminNotifications } from "@/lib/hooks/admin.hooks";

// Admin-only header bell. Shows a combined badge of support tickets still OPEN +
// contact messages not yet REPLIED, capped at "999+". Clicking opens a small
// breakdown that links to the relevant admin pages. The query is gated to admins
// by the caller (the header only renders this for user.isAdmin) and goes stale
// after 2 minutes so newly-added / closed items show up on the bell.
export function AdminNotificationBell() {
  const { data } = useAdminNotifications(true);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const support = data?.supportOpen ?? 0;
  const contact = data?.contactUnreplied ?? 0;
  const total = data?.total ?? 0;
  const badge = total > 999 ? "999+" : String(total);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={total > 0 ? `Notifications (${total})` : "Notifications"}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
      >
        <Bell className="h-5 w-5" />
        {total > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-background">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_18px_48px_-16px_rgba(20,33,61,0.25)]"
        >
          <div className="border-b border-border px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Needs attention
          </div>

          <Link
            href="/admin/support"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <LifeBuoy className="h-4 w-4 text-primary" />
              Support
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                support > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {support} unresolved
            </span>
          </Link>

          <Link
            href="/admin/contact"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4 text-primary" />
              Contact
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                contact > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {contact} unreplied
            </span>
          </Link>

          {total === 0 && (
            <p className="px-4 py-3 text-center text-xs text-muted-foreground">
              You&apos;re all caught up 🎉
            </p>
          )}
        </div>
      )}
    </div>
  );
}
