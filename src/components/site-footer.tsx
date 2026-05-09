import { Link } from "@tanstack/react-router";
import { Gem } from "lucide-react";

export function SiteFooter() {
  const cols = [
    {
      title: "Product",
      links: [
        { to: "/plugins", label: "All Plugins" },
        { to: "/pricing", label: "Pricing" },
        { to: "/plugins/woocommerce-payment-automation", label: "Featured Plugin" },
      ],
    },
    {
      title: "Resources",
      links: [
        { to: "/docs", label: "Documentation" },
        { to: "/support", label: "Support" },
        { to: "/account", label: "My Account" },
      ],
    },
    {
      title: "Company",
      links: [
        { to: "/about", label: "About" },
        { to: "/contact", label: "Contact" },
      ],
    },
  ] as const;

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-14 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-deep text-white">
              <Gem className="w-5 h-5" />
            </span>
            <span className="font-display text-lg font-bold">Three Gems</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            Premium WordPress and WooCommerce plugins built for serious stores. Clean, reliable, secure.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold text-foreground">{c.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Three Gems. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Built for WooCommerce store owners, agencies & developers.</p>
        </div>
      </div>
    </footer>
  );
}
