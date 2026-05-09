import { createFileRoute, Link } from "@tanstack/react-router";
import { Gem, Heart, Zap, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Three Gems" },
      { name: "description", content: "Three Gems builds premium WooCommerce plugins for store owners, agencies and developers." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="hero-bg">
        <div className="mx-auto max-w-4xl px-5 lg:px-8 py-16 lg:py-24 text-center">
          <span className="chip">About Three Gems</span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">A small team obsessed with making WooCommerce easier</h1>
          <p className="mt-5 text-lg text-muted-foreground">We've spent the last decade building, breaking and rebuilding WooCommerce stores. Three Gems is the toolkit we always wished existed — clean, reliable plugins that respect your store, your customers, and your time.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: Gem, t: "Quality first", d: "Every plugin is tested, audited, and shipped with the same engineering standards." },
          { icon: Heart, t: "Customer obsessed", d: "We treat support tickets like product feedback — and ship fixes fast." },
          { icon: Zap, t: "Performance focused", d: "Lean code, smart caching, no bloat. Your store stays fast." },
        ].map((v) => (
          <div key={v.t} className="card-surface p-6">
            <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary grid place-items-center"><v.icon className="w-5 h-5" /></div>
            <h3 className="mt-4 font-display text-lg font-bold">{v.t}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{v.d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 pb-16">
        <div className="rounded-3xl p-10 lg:p-14 text-white" style={{ backgroundImage: "var(--gradient-ruby)" }}>
          <Users className="w-8 h-8 text-white/80" />
          <h3 className="mt-4 font-display text-3xl font-bold">Trusted by 1,200+ stores worldwide</h3>
          <p className="mt-3 text-white/85 max-w-2xl">From boutique brands to large agencies, store owners rely on Three Gems plugins to power their daily operations.</p>
          <Link to="/plugins" className="bg-white text-primary-deep mt-6 inline-block px-5 py-3 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors">Explore plugins</Link>
        </div>
      </section>
    </div>
  );
}
