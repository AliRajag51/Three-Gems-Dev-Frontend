import Link from "next/link";
import { Gem, Heart, Zap, Users, ShieldCheck, Scale, Unlock, ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";

export const metadata = {
  title: "About — Three Gems",
  description:
    "Three Gems builds premium WooCommerce plugins for store owners, agencies and developers.",
};

const stats: { value: number; prefix?: string; suffix?: string; decimals: number; l: string }[] = [
  { value: 1200, suffix: "+", decimals: 0, l: "Active stores" },
  { value: 10, suffix: "+ yrs", decimals: 0, l: "Building on WooCommerce" },
  { value: 6, prefix: "<", suffix: "h", decimals: 0, l: "Support response" },
  { value: 4.9, suffix: "/5", decimals: 1, l: "Average rating" },
];

const expectations = [
  "Plugins tested against the latest WordPress & WooCommerce",
  "Honest, flat pricing — no hidden tiers",
  "Real engineers answering your support tickets",
  "Regular updates and security patches",
  "GPL licensed — you stay in control of your code",
];

const values = [
  { icon: Gem, t: "Quality first", d: "Every plugin is tested, audited, and shipped to the same engineering bar." },
  { icon: Heart, t: "Customer obsessed", d: "We treat support tickets like product feedback — and ship fixes fast." },
  { icon: Zap, t: "Performance focused", d: "Lean code, smart caching, no bloat. Your store stays fast." },
  { icon: ShieldCheck, t: "Secure by default", d: "Security reviews, safe defaults, and prompt patches keep your store protected." },
  { icon: Scale, t: "Fair & transparent", d: "Honest, flat pricing. No hidden tiers, no dark patterns, no surprises." },
  { icon: Unlock, t: "Yours to keep", d: "GPL licensed — your code stays yours, with no vendor lock-in." },
];

export default function AboutPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero-bg relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-50 [mask-image:radial-gradient(70%_55%_at_50%_0%,black,transparent)]" />
        <div className="pointer-events-none absolute -top-24 right-0 w-[30rem] h-[30rem] rounded-full bg-primary/10 blur-3xl animate-float-slow" />
        <div className="relative mx-auto max-w-4xl px-5 lg:px-8 py-16 lg:py-24 text-center">
          <Reveal>
            <span className="chip">About Three Gems</span>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">
              A small team obsessed with making WooCommerce easier
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              We&apos;ve spent the last decade building, breaking and rebuilding WooCommerce stores.
              Three Gems is the toolkit we always wished existed — clean, reliable plugins that
              respect your store, your customers, and your time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link href="/plugins" className="btn-ruby px-6 py-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 group">
                Browse plugins <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/contact" className="px-6 py-3.5 rounded-xl text-sm font-semibold border border-border bg-surface hover:border-primary hover:text-primary transition-colors">
                Talk to us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Stats band ── */}
      <section className="relative border-y border-border bg-surface overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 py-10 grid grid-cols-2 sm:grid-cols-4 gap-y-8 sm:divide-x divide-border">
          {stats.map((s) => (
            <div key={s.l} className="text-center px-4">
              <CountUp
                value={s.value}
                prefix={s.prefix}
                suffix={s.suffix}
                decimals={s.decimals}
                className="block font-display text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-ruby)" }}
              />
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our story ── */}
      <section className="relative mx-auto max-w-7xl px-5 lg:px-8 py-16 sm:py-20">
        <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <Reveal>
            <span className="chip">Our story</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Built by people who actually run stores
            </h2>
            <div className="mt-4 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Three Gems started with a simple frustration: most WooCommerce plugins are bloated,
                brittle, or quietly abandoned. We wanted tools we&apos;d trust on our own stores —
                and on our clients&apos;.
              </p>
              <p>
                So we build small, focused plugins that do one job well, stay fast, and keep working
                release after release. No dark patterns, no surprise upsells — just software that
                respects your store and the people who shop there.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="card-surface p-7">
              <h3 className="font-display text-lg font-bold">What that means for you</h3>
              <ul className="mt-4 space-y-3">
                {expectations.map((e) => (
                  <li key={e} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary-soft text-primary grid place-items-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <span className="text-muted-foreground leading-relaxed">{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── What we stand for ── */}
      <section className="relative mx-auto max-w-7xl px-5 lg:px-8 pb-16">
        <Reveal className="max-w-2xl relative">
          <span className="chip">What we stand for</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Principles behind every plugin
          </h2>
          <p className="mt-3 text-muted-foreground">
            The standards we hold ourselves to on every release.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 relative">
          {values.map((v, i) => (
            <Reveal key={v.t} delay={i * 60} className="h-full">
              <div className="group card-surface p-6 h-full hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_48px_-12px_rgba(201,58,74,0.16)] transition-all duration-300">
                <div className="icon-tile w-11 h-11 rounded-xl grid place-items-center">
                  <v.icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{v.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{v.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 pb-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl p-10 lg:p-14" style={{ backgroundImage: "var(--gradient-ruby)" }}>
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-float-slow" />
            <div className="absolute -left-16 -bottom-24 w-72 h-72 rounded-full bg-black/10 blur-3xl" />
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <Users className="w-8 h-8 text-white/80" />
                <h3 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Trusted by 1,200+ stores worldwide
                </h3>
                <p className="mt-3 text-white/85 max-w-lg">
                  From boutique brands to large agencies, store owners rely on Three Gems plugins to
                  power their daily operations.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link href="/plugins" className="bg-white text-primary-deep px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-white/90 hover:-translate-y-0.5 transition-all shadow-lg">
                  Explore plugins
                </Link>
                <Link href="/contact" className="bg-white/10 backdrop-blur text-white border border-white/30 px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors">
                  Talk to us
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
