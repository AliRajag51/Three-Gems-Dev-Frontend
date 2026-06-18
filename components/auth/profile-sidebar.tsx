"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserCircle, LogOut, X, User, Shield, Package } from "lucide-react";
import { useAuth } from "@/lib/context/auth.context";
import { useLogout } from "@/lib/hooks/auth.hooks";

const sidebarNav = [
  { to: "/plugins", label: "Plugins" },
  // { to: "/pricing", label: "Pricing" }, // hidden — no global pricing page
  // { to: "/docs", label: "Documentation" }, // hidden — docs not ready yet
  { to: "/support", label: "Support" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function ProfileSidebar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const { mutate: submitLogout, isPending } = useLogout();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    submitLogout(undefined, {
      onSuccess: () => {
        logout();
        setOpen(false);
        router.push("/");
      },
      onError: () => {
        logout();
        setOpen(false);
        router.push("/");
      },
    });
  };

  const panel = (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-dvh w-72 z-50 bg-surface border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <span className="text-sm font-semibold">My Account</span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable middle — scrolls if content ever exceeds the panel height, so the
            Sign out button below stays pinned and reachable without scrolling. */}
        <div className="flex-1 overflow-y-auto">

        {/* User info */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-full bg-primary/10 text-primary shrink-0">
              <User className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Account links — always visible */}
        <nav className="px-3 py-3 flex flex-col gap-0.5 border-b border-border">
          <Link
            href="/account/plugins"
            onClick={() => setOpen(false)}
            className="px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-muted transition-colors flex items-center gap-2.5"
          >
            <Package className="w-4 h-4 text-primary" />
            Manage plugins
          </Link>
        </nav>

        {/* Navigation */}
        <nav className="px-3 py-3 flex flex-col gap-0.5 lg:hidden">
          {sidebarNav.map((n) => (
            <Link
              key={n.to}
              href={n.to}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
            >
              {n.label}
            </Link>
          ))}
          {user?.isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm font-semibold text-primary rounded-lg hover:bg-primary-soft transition-colors flex items-center gap-2 mt-1"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}
        </nav>

        </div>

        {/* Logout — pinned to the bottom, always visible */}
        <div className="px-3 py-4 border-t border-border shrink-0">
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-60"
          >
            <LogOut className="w-4 h-4" />
            {isPending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Trigger button — stays inside the header */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
        aria-label="Open profile"
      >
        <UserCircle className="w-5 h-5" />
      </button>

      {/* Portal — renders outside the header's stacking context */}
      {mounted && createPortal(panel, document.body)}
    </>
  );
}
