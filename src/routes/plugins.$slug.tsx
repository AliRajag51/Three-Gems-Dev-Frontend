import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { plugins } from "@/data/plugins";
import { Star, Check, ExternalLink, Download, BookOpen, LifeBuoy, ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/plugins/$slug")({
  loader: ({ params }) => {
    const plugin = plugins.find((p) => p.slug === params.slug);
    if (!plugin) throw notFound();
    return { plugin };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.plugin.name ?? "Plugin"} — Three Gems` },
      { name: "description", content: loaderData?.plugin.tagline ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Plugin not found</h1>
      <Link to="/plugins" className="btn-ruby inline-block mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold">Back to plugins</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: PluginPage,
});

const tabs = ["Features", "Screenshots", "Compatibility", "Changelog", "FAQs", "Reviews"] as const;

function PluginPage() {
  const { plugin: p } = Route.useLoaderData();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Features");
  const [license, setLicense] = useState<"single" | "five" | "unlimited">("single");

  const licensePrice = { single: p.price, five: Math.round(p.price * 2.5), unlimited: Math.round(p.price * 6) }[license];

  return (
    <div>
      {/* Header */}
      <section className="hero-bg border-b border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 lg:py-16 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <Link to="/plugins" className="text-sm text-muted-foreground hover:text-primary">← All plugins</Link>
            <div className="mt-4 flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${p.iconColor} grid place-items-center text-3xl shadow-lg shrink-0`}>
                <span>{p.emoji}</span>
              </div>
              <div>
                <span className="chip">{p.category}</span>
                <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">{p.name}</h1>
                <p className="mt-2 text-lg text-muted-foreground">{p.tagline}</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 text-foreground font-semibold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {p.rating}
              </span>
              <span>·</span>
              <span>{p.reviews} reviews</span>
              <span>·</span>
              <span>v{p.version}</span>
              <span>·</span>
              <span className="text-emerald-600 font-semibold">Active install ready</span>
            </div>
            <p className="mt-6 max-w-2xl text-foreground/90 leading-relaxed">{p.description}</p>
          </div>

          {/* Price box */}
          <div className="card-surface p-6 h-fit lg:sticky lg:top-24">
            <p className="text-sm text-muted-foreground">Starting at</p>
            <p className="mt-1 font-display text-4xl font-bold">${licensePrice}<span className="text-base font-medium text-muted-foreground">/year</span></p>

            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">License</p>
              {([
                { id: "single", label: "Single Site License", sub: "1 site" },
                { id: "five", label: "5 Site License", sub: "5 sites" },
                { id: "unlimited", label: "Unlimited Sites", sub: "Unlimited" },
              ] as const).map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLicense(l.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    license === l.id ? "border-primary bg-primary-soft" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{l.label}</span>
                    <span className="text-xs text-muted-foreground">{l.sub}</span>
                  </div>
                </button>
              ))}
            </div>

            <Link to="/checkout" search={{ plugin: p.slug, license }} className="btn-ruby mt-5 w-full block text-center px-5 py-3 rounded-xl text-sm font-semibold">
              Buy Now — ${licensePrice}
            </Link>
            <a href="#" className="mt-2 w-full block text-center px-5 py-3 rounded-xl text-sm font-semibold border border-border hover:border-primary hover:text-primary transition-colors">
              <ExternalLink className="inline w-4 h-4 mr-1.5" /> Live Demo
            </a>

            <div className="mt-5 pt-5 border-t border-border space-y-2.5 text-sm">
              <Row icon={Download} text="1 year of updates" />
              <Row icon={LifeBuoy} text="1 year of email support" />
              <Row icon={BookOpen} text="Detailed documentation" />
              <Row icon={Check} text="30-day money-back" />
            </div>

            <div className="mt-5 pt-5 border-t border-border flex gap-3 text-xs">
              <Link to="/docs" className="text-primary font-semibold">Docs</Link>
              <span className="text-border">|</span>
              <Link to="/support" className="text-primary font-semibold">Support</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-12 lg:grid lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2">
          <div className="flex gap-1 overflow-x-auto border-b border-border">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="py-8">
            {tab === "Features" && (
              <ul className="grid sm:grid-cols-2 gap-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 p-4 rounded-xl bg-surface border border-border">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{f}</span>
                  </li>
                ))}
              </ul>
            )}
            {tab === "Screenshots" && (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-video rounded-xl border border-border bg-gradient-to-br from-primary-soft via-surface to-background grid place-items-center">
                    <span className="text-xs text-muted-foreground">Screenshot {i}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === "Compatibility" && (
              <div className="card-surface p-6 space-y-3">
                {[
                  ["WordPress", "6.0 – latest"],
                  ["WooCommerce", "7.0 – latest"],
                  ["PHP", "7.4+ (PHP 8.2 recommended)"],
                  ["MySQL", "5.7+ / MariaDB 10.3+"],
                  ["Multisite", "Supported"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border last:border-0 pb-2 last:pb-0">
                    <span className="text-sm font-semibold">{k}</span>
                    <span className="text-sm text-muted-foreground">{v}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === "Changelog" && (
              <div className="space-y-4">
                {[
                  { v: p.version, d: "2026-04-22", notes: ["Performance improvements", "Added WooCommerce HPOS support", "Bug fix: edge case in license validation"] },
                  { v: "2.3.0", d: "2026-02-10", notes: ["New analytics dashboard", "Slack integration"] },
                  { v: "2.2.5", d: "2026-01-04", notes: ["Security hardening", "Translation updates"] },
                ].map((c) => (
                  <div key={c.v} className="card-surface p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-display font-bold">v{c.v}</p>
                      <p className="text-xs text-muted-foreground">{c.d}</p>
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {c.notes.map((n) => <li key={n}>• {n}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {tab === "FAQs" && (
              <div className="space-y-3">
                {[
                  { q: "Does it work with the latest WooCommerce?", a: "Yes — every release is tested with the latest WooCommerce version on day one." },
                  { q: "Can I use one license on multiple sites?", a: "Single Site licenses cover one production site. Use the 5-site or Unlimited license for more." },
                  { q: "Is there a refund policy?", a: "Absolutely. We offer a no-questions-asked 30-day money-back guarantee." },
                  { q: "Do you offer customizations?", a: "Yes — agencies and enterprise customers can request paid customization through support." },
                ].map((f) => <FAQ key={f.q} {...f} />)}
              </div>
            )}
            {tab === "Reviews" && (
              <div className="space-y-4">
                {[
                  { n: "Sarah K.", r: "Saved us 10+ hours per week. The admin UI is gorgeous.", s: 5 },
                  { n: "Marco D.", r: "Best plugin we've bought all year. Support replied in 2 hours.", s: 5 },
                  { n: "Aisha P.", r: "Solid, well-built plugin. Worth every penny.", s: 5 },
                ].map((r) => (
                  <div key={r.n} className="card-surface p-5">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: r.s }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="mt-2 text-sm">{r.r}</p>
                    <p className="mt-2 text-xs text-muted-foreground font-semibold">— {r.n}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="card-surface p-6 sticky top-24">
            <h4 className="font-display font-bold">Need help?</h4>
            <p className="mt-1.5 text-sm text-muted-foreground">Our support engineers reply in under 6 hours.</p>
            <Link to="/support" className="btn-ruby mt-4 block text-center px-4 py-2.5 rounded-xl text-sm font-semibold">Contact Support</Link>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Row({ icon: Icon, text }: { icon: typeof Check; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="w-4 h-4 text-primary" />
      <span>{text}</span>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="w-full text-left card-surface p-5 hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold">{q}</span>
        <ChevronDown className={`w-5 h-5 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </div>
      {open && <p className="mt-3 text-sm text-muted-foreground">{a}</p>}
    </button>
  );
}
