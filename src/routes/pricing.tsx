import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Star } from "lucide-react";
import { tiers } from "@/data/plugins";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Three Gems" },
      {
        name: "description",
        content:
          "Simple, transparent pricing for Three Gems WooCommerce plugins. Single site, 5 sites, and unlimited licenses.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div>
      <section className="hero-bg">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16 lg:py-20 text-center">
          <span className="chip">Pricing</span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Simple pricing, serious value
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose a license that fits your business. All plans include updates, support, and our
            30-day money-back guarantee.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 pb-20 -mt-4">
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`card-surface p-8 flex flex-col relative ${t.highlight ? "border-primary shadow-[0_20px_48px_-12px_rgba(201,58,74,0.25)] lg:-translate-y-2" : ""}`}
            >
              {t.highlight && (
                <span
                  className="absolute -top-3 left-8 chip"
                  style={{ background: "var(--gradient-ruby)", color: "white" }}
                >
                  <Star className="w-3 h-3 fill-white" /> Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold">{t.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground min-h-10">{t.description}</p>
              <div className="mt-6">
                <span className="font-display text-5xl font-extrabold">${t.price}</span>
                <span className="text-muted-foreground">/year</span>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/checkout"
                search={{ tier: t.name }}
                className={`mt-8 block text-center px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  t.highlight
                    ? "btn-ruby"
                    : "border border-border hover:border-primary hover:text-primary"
                }`}
              >
                Get {t.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 card-surface p-8 lg:p-10 grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="font-display text-2xl font-bold">Need a bundle for your agency?</h3>
            <p className="mt-2 text-muted-foreground">
              Get every Three Gems plugin in one license — perfect for agencies managing multiple
              WooCommerce stores.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link to="/contact" className="btn-ruby px-5 py-3 rounded-xl text-sm font-semibold">
              Talk to sales
            </Link>
            <Link
              to="/plugins"
              className="px-5 py-3 rounded-xl text-sm font-semibold border border-border hover:border-primary hover:text-primary transition-colors"
            >
              Browse plugins
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
