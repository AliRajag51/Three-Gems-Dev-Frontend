"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gem, Menu, X, Shield } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/context/auth.context";
import { ProfileSidebar } from "@/components/auth/profile-sidebar";
import { AdminNotificationBell } from "@/components/admin/notification-bell";

const nav: { to: string; label: string; authOnly?: boolean }[] = [
  { to: "/plugins", label: "Plugins" },
  // { to: "/pricing", label: "Pricing" }, // hidden — no global pricing page
  // { to: "/docs", label: "Documentation" }, // hidden — docs not ready yet
  { to: "/support", label: "Support", authOnly: true },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  // "Support" is for signed-in customers only — hide it from logged-out visitors.
  const visibleNav = nav.filter((n) => !n.authOnly || !!user);

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex items-center gap-2 group justify-self-start shrink-0">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-linear-to-br from-primary to-primary-deep text-white shadow-[0_6px_16px_-4px_rgba(201,58,74,0.45)] shrink-0">
            <Gem className="w-5 h-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight whitespace-nowrap">Three Gems</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 justify-self-center">
          {visibleNav.map((n) => (
            <Link
              key={n.to}
              href={n.to}
              className={
                isActive(n.to)
                  ? "px-3 py-2 text-sm font-semibold text-primary rounded-md"
                  : "px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors"
              }
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          {/* Admin notification bell — admins only, shown on all sizes (never in the
              mobile hamburger, which only renders for logged-out visitors). */}
          {!isLoading && user?.isAdmin && <AdminNotificationBell />}

          {/* Desktop-only nav buttons */}
          <div className="hidden lg:flex items-center gap-2">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : (
              <>
                {user?.isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-primary border border-primary/30 hover:bg-primary-soft transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                {!user && (
                  <>
                    <Link
                      href="/account/login"
                      className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link href="/plugins" className="btn-ruby px-4 py-2 rounded-xl text-sm font-semibold">
                      Browse Plugins
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Profile sidebar — visible on all sizes when logged in */}
          {!isLoading && user && <ProfileSidebar />}

          {/* Hamburger — mobile only, only when NOT logged in */}
          {!isLoading && !user && (
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-md hover:bg-muted"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {open && !user && (
        <div className="lg:hidden border-t border-border bg-surface">
          <div className="px-5 py-3 flex flex-col">
            {visibleNav.map((n) => (
              <Link
                key={n.to}
                href={n.to}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/account/login"
              onClick={() => setOpen(false)}
              className="py-2.5 text-sm font-medium"
            >
              Sign in
            </Link>
            <Link
              href="/plugins"
              onClick={() => setOpen(false)}
              className="btn-ruby mt-2 px-4 py-2 rounded-xl text-sm font-semibold text-center"
            >
              Browse Plugins
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
