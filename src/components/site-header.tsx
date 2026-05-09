import { Link } from "@tanstack/react-router";
import { Gem, Menu, X } from "lucide-react";
import { useState } from "react";

const nav = [
  { to: "/plugins", label: "Plugins" },
  { to: "/pricing", label: "Pricing" },
  { to: "/docs", label: "Documentation" },
  { to: "/support", label: "Support" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-deep text-white shadow-[0_6px_16px_-4px_rgba(201,58,74,0.45)]">
            <Gem className="w-5 h-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Three Gems</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors"
              activeProps={{ className: "px-3 py-2 text-sm font-semibold text-primary rounded-md" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Link to="/account" className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
            Sign in
          </Link>
          <Link to="/plugins" className="btn-ruby px-4 py-2 rounded-xl text-sm font-semibold">
            Browse Plugins
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-md hover:bg-muted">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-surface">
          <div className="px-5 py-3 flex flex-col">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2.5 text-sm font-medium">
                {n.label}
              </Link>
            ))}
            <Link to="/account" onClick={() => setOpen(false)} className="py-2.5 text-sm font-medium">Sign in</Link>
            <Link to="/plugins" onClick={() => setOpen(false)} className="btn-ruby mt-2 px-4 py-2 rounded-xl text-sm font-semibold text-center">
              Browse Plugins
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
