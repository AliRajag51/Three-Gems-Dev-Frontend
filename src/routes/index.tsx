import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Zap,
  LayoutDashboard,
  KeyRound,
  Headphones,
  RefreshCw,
  ArrowRight,
  Check,
} from "lucide-react";
import { plugins } from "@/data/plugins";
import { PluginCard } from "@/components/plugin-card";
import { DashboardMockup } from "@/components/dashboard-mockup";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Three Gems — Powerful WooCommerce Plugins" },
      {
        name: "description",
        content:
          "Three Gems creates clean, reliable WordPress and WooCommerce plugins that help store owners automate workflows, improve checkout, and grow faster.",
      },
    ],
  }),
  component: HomePage,
});

const features = [
  {
    icon: ShieldCheck,
    title: "WooCommerce Ready",
    text: "Tested against the latest WooCommerce releases and themes.",
  },
  {
    icon: Zap,
    title: "Easy Setup",
    text: "Install, activate, configure in minutes — guided onboarding included.",
  },
  {
    icon: LayoutDashboard,
    title: "Clean Admin UI",
    text: "Native WordPress feel with thoughtful dashboards your team will love.",
  },
  {
    icon: KeyRound,
    title: "Secure Licensing",
    text: "Built-in license validation, site limits and renewals you control.",
  },
  {
    icon: Headphones,
    title: "Fast Support",
    text: "Real engineers answering tickets — average response under 6 hours.",
  },
  {
    icon: RefreshCw,
    title: "Regular Updates",
    text: "Continuous improvements, security patches and new features.",
  },
];

function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-bg">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-16 lg:pt-24 pb-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="chip">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Trusted by 1,200+ WooCommerce stores
            </span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Powerful WooCommerce Plugins{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-ruby)" }}
              >
                Built for Serious Stores
              </span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Three Gems creates clean, reliable, and easy-to-use WordPress plugins that help store
              owners automate workflows, improve checkout, and grow faster.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/plugins"
                className="btn-ruby px-6 py-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
              >
                Browse Plugins <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/docs"
                className="px-6 py-3.5 rounded-xl text-sm font-semibold border border-border bg-surface hover:border-primary hover:text-primary transition-colors"
              >
                View Documentation
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["30-day money-back", "Lifetime support options", "GPL licensed"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-primary" /> {t}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:pl-6">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { v: "1,200+", l: "Active stores" },
            { v: "98%", l: "Renewal rate" },
            { v: "<6h", l: "Support response" },
            { v: "4.9/5", l: "Average rating" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-2xl sm:text-3xl font-bold text-primary-deep">{s.v}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
        <div className="max-w-2xl">
          <span className="chip">Why Three Gems</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Everything serious WooCommerce stores need
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built by engineers who run real stores. Every plugin ships with the same quality bar.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card-surface p-6 hover:-translate-y-0.5 hover:border-primary/40 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary grid place-items-center">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured plugins */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 pb-20">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="max-w-2xl">
            <span className="chip">Featured Plugins</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Hand-crafted tools for WooCommerce
            </h2>
            <p className="mt-3 text-muted-foreground">
              Pick a plugin, install in minutes, and start automating today.
            </p>
          </div>
          <Link
            to="/plugins"
            className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            See all plugins <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plugins.map((p) => (
            <PluginCard key={p.slug} p={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 pb-8">
        <div
          className="relative overflow-hidden rounded-3xl p-10 lg:p-14"
          style={{ backgroundImage: "var(--gradient-ruby)" }}
        >
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Ready to ship a faster, smarter store?
              </h3>
              <p className="mt-3 text-white/85 max-w-lg">
                Join hundreds of WooCommerce stores already running on Three Gems plugins.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                to="/pricing"
                className="bg-white text-primary-deep px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                See pricing
              </Link>
              <Link
                to="/contact"
                className="bg-white/10 backdrop-blur text-white border border-white/30 px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                Talk to sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
