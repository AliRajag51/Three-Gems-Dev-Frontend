import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Three Gems" },
      {
        name: "description",
        content:
          "Three Gems prices each plugin individually. See each plugin's page for its license tiers and pricing.",
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
            Pricing that fits each plugin
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Every Three Gems plugin is priced individually based on what it does — pick a plugin and
            you'll see its full license tiers on the product page.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link
              to="/plugins"
              className="btn-ruby px-6 py-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
            >
              Browse plugins <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3.5 rounded-xl text-sm font-semibold border border-border bg-surface hover:border-primary hover:text-primary transition-colors"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 lg:px-8 py-20">
        <div className="card-surface p-8 lg:p-10">
          <h2 className="font-display text-2xl font-bold">What every license includes</h2>
          <p className="mt-2 text-muted-foreground">
            No matter which plugin or tier you pick, all Three Gems licenses ship with the same
            quality bar.
          </p>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3">
            {[
              "Use on production sites (limit varies by tier)",
              "Plugin updates for the license window",
              "Email support from real engineers",
              "Detailed documentation",
              "30-day money-back guarantee",
              "GPL licensed code you can audit",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 card-surface p-8 lg:p-10 grid lg:grid-cols-2 gap-6 items-center">
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
