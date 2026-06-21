"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gem, LayoutDashboard, Package, Plus, ChevronDown, ChevronRight, LogOut, Tag, LifeBuoy, Mail, Users, UserCheck, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth.context";
import { useLogout } from "@/lib/hooks/auth.hooks";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Plugins",
    icon: Package,
    children: [
      { label: "All Plugins", href: "/admin/plugins" },
      { label: "Add New", href: "/admin/plugins/new", icon: Plus },
    ],
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: UserCheck,
  },
  {
    label: "Discounts",
    href: "/admin/discounts",
    icon: Tag,
  },
  {
    label: "Support",
    href: "/admin/support",
    icon: LifeBuoy,
  },
  {
    label: "Contact",
    href: "/admin/contact",
    icon: Mail,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer whenever the route changes (e.g. after tapping a nav link).
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // While the drawer is open: lock body scroll and allow Esc to close it.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Desktop rail: pinned, full viewport height so "Sign out" is always visible ── */}
      <aside className="hidden lg:flex lg:flex-col w-56 shrink-0 self-start sticky top-0 h-screen bg-[#1e1e2e]">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* ── Mobile top bar with hamburger ── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-[#1e1e2e] flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary-deep text-white shadow-md">
            <Gem className="w-4 h-4" />
          </span>
          <p className="text-white text-sm font-bold">
            Three Gems <span className="text-white/40 font-normal">Admin</span>
          </p>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          className="p-2 -mr-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* ── Mobile drawer + backdrop (always mounted for a smooth slide transition) ── */}
      <div className={`lg:hidden fixed inset-0 z-50 ${mobileOpen ? "" : "pointer-events-none"}`}>
        {/* Backdrop */}
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Sliding panel */}
        <aside
          className={`absolute top-0 left-0 h-full w-72 max-w-[80%] bg-[#1e1e2e] flex flex-col shadow-2xl transition-transform duration-200 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="absolute top-4 right-3 z-10 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
        </aside>
      </div>
    </>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { user, logout } = useAuth();
  const { mutate: submitLogout, isPending } = useLogout();
  const router = useRouter();
  const [openGroups, setOpenGroups] = useState<string[]>(["Plugins"]);

  // Same flow as the normal (profile) sign out: clear the backend session, then the
  // client state, then redirect home. Falls through to the same cleanup on error.
  const handleLogout = () => {
    submitLogout(undefined, {
      onSuccess: () => {
        logout();
        onNavigate?.();
        router.push("/");
      },
      onError: () => {
        logout();
        onNavigate?.();
        router.push("/");
      },
    });
  };

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10 shrink-0">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-2.5">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary-deep text-white shadow-md">
            <Gem className="w-4 h-4" />
          </span>
          <div>
            <p className="text-white text-sm font-bold leading-tight">Three Gems</p>
            <p className="text-white/40 text-[10px]">Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav — scrolls independently so the user block stays pinned at the bottom */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
        {navItems.map((item) => {
          if (item.children) {
            const open = openGroups.includes(item.label);
            const groupActive = item.children.some((c) => isActive(c.href));
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    groupActive
                      ? "text-white bg-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {open ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
                {open && (
                  <div className="ml-3 mt-0.5 pl-4 border-l border-white/10 flex flex-col gap-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onNavigate}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          isActive(child.href, child.href === "/admin/plugins")
                            ? "text-white bg-primary/30 font-semibold"
                            : "text-white/55 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {"icon" in child && child.icon && <child.icon className="w-3.5 h-3.5" />}
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(item.href!, item.exact)
                  ? "text-white bg-white/10 font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/30 grid place-items-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name ?? "Admin"}</p>
            <p className="text-white/40 text-[10px] truncate">{user?.email ?? ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-60"
        >
          <LogOut className="w-3.5 h-3.5" />
          {isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </>
  );
}
