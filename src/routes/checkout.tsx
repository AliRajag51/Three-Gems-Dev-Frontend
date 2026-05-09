import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, Check } from "lucide-react";
import { plugins } from "@/data/plugins";

type Search = { plugin?: string; license?: "single" | "five" | "unlimited"; tier?: string };

export const Route = createFileRoute("/checkout")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    plugin: typeof s.plugin === "string" ? s.plugin : undefined,
    license: s.license === "five" || s.license === "unlimited" ? s.license : "single",
    tier: typeof s.tier === "string" ? s.tier : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Checkout — Three Gems" },
      { name: "description", content: "Complete your Three Gems plugin purchase securely." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { plugin: slug, license = "single" } = Route.useSearch();
  const lic: "single" | "five" | "unlimited" = license ?? "single";
  const plugin = plugins.find((p) => p.slug === slug) ?? plugins[0];
  const mult = { single: 1, five: 2.5, unlimited: 6 }[lic];
  const subtotal = Math.round(plugin.price * mult);
  const tax = Math.round(subtotal * 0.0);
  const total = subtotal + tax;

  const licenseLabel = { single: "Single Site", five: "5 Sites", unlimited: "Unlimited Sites" }[
    lic
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 lg:py-16">
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <h1 className="font-display text-3xl font-bold">Checkout</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Secure your license in under 60 seconds.
          </p>

          <div className="mt-8 space-y-6">
            <Section title="Account">
              <Field label="Email" type="email" placeholder="you@store.com" />
            </Section>

            <Section title="Billing details">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First name" />
                <Field label="Last name" />
                <Field label="Company (optional)" wrap />
                <Field label="Country" wrap />
              </div>
            </Section>

            <Section title="Payment">
              <div className="space-y-3">
                <Field label="Card number" placeholder="4242 4242 4242 4242" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry" placeholder="MM/YY" />
                  <Field label="CVC" placeholder="123" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Encrypted with industry-standard SSL.
              </p>
            </Section>

            <button className="btn-ruby w-full px-5 py-3.5 rounded-xl text-sm font-semibold">
              Pay ${total} — Complete purchase
            </button>
          </div>
        </div>

        <aside className="lg:col-span-2">
          <div className="card-surface p-6 lg:sticky lg:top-24">
            <h3 className="font-display text-lg font-bold">Order summary</h3>
            <div className="mt-5 flex items-start gap-3 pb-5 border-b border-border">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plugin.iconColor} grid place-items-center text-2xl shrink-0`}
              >
                <span>{plugin.emoji}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{plugin.name}</p>
                <p className="text-xs text-muted-foreground">
                  {licenseLabel} · 1 year of updates & support
                </p>
              </div>
              <p className="font-display font-bold">${subtotal}</p>
            </div>

            <dl className="mt-5 space-y-2.5 text-sm">
              <Row dt="Subtotal" dd={`$${subtotal}`} />
              <Row dt="Tax" dd={`$${tax}`} />
              <div className="border-t border-border pt-3 flex justify-between">
                <dt className="font-display font-bold">Total</dt>
                <dd className="font-display text-xl font-bold">${total}</dd>
              </div>
            </dl>

            <div className="mt-6 space-y-2 text-sm">
              {["30-day money-back guarantee", "Instant download access", "Renewal at 50% off"].map(
                (t) => (
                  <p key={t} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-primary" /> {t}
                  </p>
                ),
              )}
            </div>

            <p className="mt-5 text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Secure checkout · GDPR compliant
            </p>
            <Link
              to="/plugins"
              className="mt-4 block text-center text-xs text-muted-foreground hover:text-primary"
            >
              ← Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-surface p-6">
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Row({ dt, dd }: { dt: string; dd: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{dt}</dt>
      <dd className="font-semibold">{dd}</dd>
    </div>
  );
}

function Field({
  label,
  wrap,
  ...rest
}: { label: string; wrap?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={wrap ? "sm:col-span-2" : ""}>
      <label className="text-sm font-semibold">{label}</label>
      <input
        {...rest}
        className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}
