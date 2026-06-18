import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  LayoutDashboard,
  KeyRound,
  Headphones,
  RefreshCw,
  ArrowRight,
  Check,
  CreditCard,
  Megaphone,
  Package,
  Rocket,
  BarChart3,
  ShoppingCart,
  Download,
  Star,
  Quote,
  TrendingUp,
} from "lucide-react";
import { FeaturedPlugins } from "@/components/featured-plugins";
import { DashboardMockup } from "@/components/dashboard-mockup";
import { Reveal } from "@/components/reveal";
import { HomeTop } from "@/components/home-top";
import { FaqAccordion } from "@/components/faq-accordion";

export const metadata = {
  title: "Three Gems — Powerful WooCommerce Plugins",
  description:
    "Three Gems creates clean, reliable WordPress and WooCommerce plugins that help store owners automate workflows, improve checkout, and grow faster.",
};

const integrations = ["WordPress", "WooCommerce", "Elementor", "PHP 8", "Stripe", "PayPal"];

const stats = [
  { v: "1,200+", l: "Active stores" },
  { v: "98%", l: "Renewal rate" },
  { v: "<6h", l: "Support response" },
  { v: "4.9/5", l: "Average rating" },
];

const categories = [
  { icon: CreditCard, title: "Payments & Checkout", text: "Smoother carts, fewer drop-offs, automated billing." },
  { icon: Megaphone, title: "Marketing & Email", text: "Recover carts, upsell, and grow your list on autopilot." },
  { icon: Package, title: "Inventory & Orders", text: "Sync stock, manage fulfilment, and tidy up orders." },
  { icon: Rocket, title: "SEO & Performance", text: "Faster pages and cleaner markup that ranks." },
  { icon: ShieldCheck, title: "Security & Licensing", text: "Protect your store and control plugin access." },
  { icon: BarChart3, title: "Analytics & Reports", text: "Know what's selling with clear, native dashboards." },
];

const steps = [
  {
    icon: ShoppingCart,
    title: "Choose your plugin",
    text: "Browse the marketplace and pick the tools your store actually needs.",
  },
  {
    icon: CreditCard,
    title: "Checkout securely",
    text: "Pay once or subscribe via PayPal. Instant access and a 30-day money-back guarantee.",
  },
  {
    icon: Download,
    title: "Activate & auto-update",
    text: "Drop in your license key, download, and get updates and support all year.",
  },
];

const features = [
  { icon: ShieldCheck, title: "WooCommerce Ready", text: "Tested against the latest WooCommerce releases and themes." },
  { icon: Zap, title: "Easy Setup", text: "Install, activate, configure in minutes — guided onboarding included." },
  { icon: LayoutDashboard, title: "Clean Admin UI", text: "Native WordPress feel with thoughtful dashboards your team will love." },
  { icon: KeyRound, title: "Secure Licensing", text: "Built-in license validation, site limits and renewals you control." },
  { icon: Headphones, title: "Fast Support", text: "Real engineers answering tickets — average response under 6 hours." },
  { icon: RefreshCw, title: "Regular Updates", text: "Continuous improvements, security patches and new features." },
];

const testimonials = [
  {
    quote: "Setup took five minutes and our abandoned-cart recovery jumped 18%. Support actually replies — fast.",
    name: "Sarah Lin",
    role: "Store Owner, Coastline Goods",
  },
  {
    quote: "We deploy Three Gems plugins across 30+ client stores. Rock-solid, and the licensing is completely painless.",
    name: "Diego Martins",
    role: "Agency Lead, PixelForge",
  },
  {
    quote: "Clean admin UI, zero bloat. It feels like a native part of WooCommerce, not a bolt-on.",
    name: "Amara Okafor",
    role: "Founder, The Linen Room",
  },
];

const faqs = [
  {
    q: "Do the plugins work with the latest WooCommerce?",
    a: "Yes. Every plugin is tested against the latest WordPress and WooCommerce releases, plus popular themes.",
  },
  {
    q: "How does licensing work?",
    a: "Each purchase gives you a license key with a site limit. Activate it on your sites and manage renewals from your account — no manual tracking needed.",
  },
  {
    q: "Can I use one license on multiple sites?",
    a: "It depends on the plan you choose. Plans range from a single site up to multiple sites or unlimited, so you only pay for what you need.",
  },
  {
    q: "What's your refund policy?",
    a: "Every purchase is backed by a 30-day money-back guarantee. If it's not the right fit, we'll refund you.",
  },
  {
    q: "Do I get updates and support?",
    a: "Yes — updates and email support are included for your plan period (typically one year) and are renewable to keep your store current.",
  },
  {
    q: "Are the plugins GPL licensed?",
    a: "Yes, all of our plugins are GPL licensed, so you stay in full control of the code on your own stores.",
  },
];

export default function HomePage() {
  return (
    <div>
      <HomeTop>
      {/* ── Hero ── */}
      <section className="hero-bg relative overflow-hidden">
        {/* Ambient depth */}
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(70%_55%_at_50%_0%,black,transparent)]" />
        <div className="pointer-events-none absolute -top-24 right-0 w-[34rem] h-[34rem] rounded-full bg-primary/10 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute top-44 -left-24 w-[26rem] h-[26rem] rounded-full bg-primary/[0.07] blur-3xl animate-float" />

        <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-16 lg:pt-24 pb-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative">
          <Reveal>
            <span className="chip">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-primary" />
              </span>
              Trusted by 1,200+ WooCommerce stores
            </span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Powerful WooCommerce Plugins{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-ruby)" }}>
                Built for Serious Stores
              </span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Three Gems creates clean, reliable, and easy-to-use WordPress plugins that help store
              owners automate workflows, improve checkout, and grow faster.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/plugins" className="btn-ruby px-6 py-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 group">
                Browse Plugins <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/docs" className="px-6 py-3.5 rounded-xl text-sm font-semibold border border-border bg-surface hover:border-primary hover:text-primary transition-colors">
                View Documentation
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["30-day money-back", "Lifetime support options", "GPL licensed"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-primary-soft text-primary grid place-items-center">
                    <Check className="w-3 h-3" />
                  </span>
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120} className="lg:pl-6">
            <DashboardMockup />
          </Reveal>
        </div>

        {/* Integrations strip */}
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pb-12">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Plays nicely with your stack
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            {integrations.map((name) => (
              <span key={name} className="px-3.5 py-1.5 rounded-full border border-border bg-surface text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary hover:-translate-y-0.5 transition-all">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats band ── */}
      <section className="relative border-y border-border bg-surface overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 py-10 grid grid-cols-2 sm:grid-cols-4 gap-y-8 sm:divide-x divide-border">
          {stats.map((s) => (
            <div key={s.l} className="text-center px-4">
              <p
                className="font-display text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-ruby)" }}
              >
                {s.v}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">{s.l}</p>
            </div>
          ))}
        </div>
      </section>
      </HomeTop>

      {/* ── Featured plugins (shown first — lead with the actual products) ── */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-12 sm:py-20">
        <Reveal className="flex items-end justify-between gap-6 flex-wrap">
          <div className="max-w-2xl">
            <span className="chip">Featured Plugins</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Hand-crafted tools for WooCommerce
            </h2>
            <p className="mt-3 text-muted-foreground">
              Pick a plugin, install in minutes, and start automating today.
            </p>
          </div>
          <Link href="/plugins" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
            See all plugins <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
        <FeaturedPlugins />
      </section>

      {/* ── Browse by use case ── */}
      <section className="relative mx-auto max-w-7xl px-5 lg:px-8 pb-12 sm:pb-20 overflow-hidden">
        <div className="pointer-events-none absolute top-10 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <Reveal className="max-w-2xl relative">
          <span className="chip">Browse the marketplace</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
            A plugin for every part of your store
          </h2>
          <p className="mt-3 text-muted-foreground">
            From checkout to analytics — find the right tool by what you want to improve.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 relative">
          {categories.map((c, i) => (
            <Reveal key={c.title} delay={i * 60} className="h-full">
              <Link
                href="/plugins"
                className="group card-surface p-6 h-full flex flex-col hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_48px_-12px_rgba(201,58,74,0.18)] transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="icon-tile w-11 h-11 rounded-xl grid place-items-center">
                    <c.icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{c.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{c.text}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative bg-surface border-y border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid-lines opacity-70 [mask-image:radial-gradient(80%_70%_at_50%_50%,black,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 py-20">
          <Reveal className="max-w-2xl">
            <span className="chip">How it works</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
              From cart to live in three steps
            </h2>
            <p className="mt-3 text-muted-foreground">No developers required — you&apos;ll be up and running today.</p>
          </Reveal>
          <div className="mt-12 relative grid gap-6 md:grid-cols-3">
            {/* connector line */}
            <div className="hidden md:block absolute top-[3.4rem] left-[16%] right-[16%] border-t-2 border-dashed border-primary/25" />
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 90} className="h-full">
                <div className="group relative card-surface p-7 h-full">
                  <span className="absolute -top-3 left-7 px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundImage: "var(--gradient-ruby)" }}>
                    Step {i + 1}
                  </span>
                  <span className="pointer-events-none absolute right-5 top-4 font-display text-6xl font-extrabold text-primary/5 leading-none select-none">
                    {i + 1}
                  </span>
                  <div className="icon-tile w-12 h-12 rounded-2xl grid place-items-center relative">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Three Gems ── */}
      <section className="relative mx-auto max-w-7xl px-5 lg:px-8 py-20 overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <Reveal className="max-w-2xl relative">
          <span className="chip">Why Three Gems</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Everything serious WooCommerce stores need
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built by engineers who run real stores. Every plugin ships with the same quality bar.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 relative">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 60} className="h-full">
              <div className="group card-surface p-6 h-full hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_48px_-12px_rgba(201,58,74,0.16)] transition-all duration-300">
                <div className="icon-tile w-11 h-11 rounded-xl grid place-items-center">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative bg-surface border-y border-border overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 py-20">
          <Reveal className="max-w-2xl">
            <span className="chip">Loved by store owners</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Trusted by stores and agencies alike
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 90} className="h-full">
                <figure className="card-surface p-7 flex flex-col h-full hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(201,58,74,0.16)] transition-all duration-300">
                  <Quote className="w-7 h-7 text-primary/30" />
                  <div className="mt-3 flex gap-0.5 text-primary">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90 flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-primary-deep text-white grid place-items-center font-display text-sm font-bold ring-2 ring-primary/15">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <span>
                      <p className="text-sm font-semibold leading-tight">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
        <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
          <Reveal className="lg:col-span-1">
            <span className="chip">FAQ</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Questions, answered
            </h2>
            <p className="mt-3 text-muted-foreground">
              Still unsure? <Link href="/contact" className="text-primary font-semibold hover:underline">Talk to us</Link> — we reply fast.
            </p>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-2">
            <FaqAccordion items={faqs} />
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 pb-12">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl p-10 lg:p-14" style={{ backgroundImage: "var(--gradient-ruby)" }}>
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-float-slow" />
            <div className="absolute -left-16 -bottom-24 w-72 h-72 rounded-full bg-black/10 blur-3xl" />
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 bg-white/15 px-3 py-1 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" /> Grow faster today
                </span>
                <h3 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Ready to ship a faster, smarter store?
                </h3>
                <p className="mt-3 text-white/85 max-w-lg">
                  Join hundreds of WooCommerce stores already running on Three Gems plugins.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link href="/plugins" className="bg-white text-primary-deep px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-white/90 hover:-translate-y-0.5 transition-all shadow-lg">
                  Browse plugins
                </Link>
                <Link href="/contact" className="bg-white/10 backdrop-blur text-white border border-white/30 px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors">
                  Talk to sales
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
