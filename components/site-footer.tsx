"use client";

import Link from "next/link";
import { Gem } from "lucide-react";
import { usePlugins } from "@/lib/hooks/plugin.hooks";

export function SiteFooter() {
  // The "Product" column lists every active plugin the visitor can see (from the
  // same cached catalog query the rest of the site uses), each linking to its page.
  const { data: plugins } = usePlugins();

  const cols = [
    {
      title: "Product",
      links: [
        { href: "/plugins", label: "All Plugins" },
        ...(plugins ?? []).map((p) => ({ href: `/plugins/${p.slug}`, label: p.name })),
      ],
    },
    {
      title: "Resources",
      links: [
        // { href: "/docs", label: "Documentation" }, // hidden — docs not ready yet
        { href: "/support", label: "Support" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/privacy", label: "Privacy Policy" },
      ],
    },
  ];

  return (
    <footer className="mt-10 sm:mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-10 sm:py-14 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-deep text-white">
              <Gem className="w-5 h-5" />
            </span>
            <span className="font-display text-lg font-bold">Three Gems</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            Premium WordPress and WooCommerce plugins built for serious stores. Clean, reliable,
            secure.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold text-foreground">{c.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
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
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Three Gems. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for WooCommerce store owners, agencies & developers.
          </p>
        </div>
      </div>
    </footer>
  );
}
