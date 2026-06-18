import Link from "next/link";
import { BookOpen, Rocket, Settings, Code, Shield, RefreshCw, Search } from "lucide-react";

export const metadata = {
  title: "Documentation — Three Gems",
  description:
    "Guides, API references, and tutorials for every Three Gems WooCommerce plugin.",
};

const sections = [
  {
    icon: Rocket,
    title: "Getting Started",
    text: "Install your first plugin and activate your license in under 5 minutes.",
  },
  {
    icon: Settings,
    title: "Configuration",
    text: "Plugin settings, options, and best practices for production stores.",
  },
  {
    icon: Code,
    title: "Developer API",
    text: "Hooks, filters, REST endpoints and code examples for every plugin.",
  },
  {
    icon: Shield,
    title: "Security & Licensing",
    text: "How licensing, activation, and site limits work under the hood.",
  },
  {
    icon: RefreshCw,
    title: "Updates & Migration",
    text: "Safely update plugins and migrate workflows between sites.",
  },
  {
    icon: BookOpen,
    title: "Tutorials",
    text: "Step-by-step guides for the most common WooCommerce automations.",
  },
];

export default function DocsPage() {
  return (
    <div>
      <section className="hero-bg">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-14 pb-10 lg:pt-16 lg:pb-12">
          <span className="chip">Documentation</span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Documentation
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Everything you need to install, configure, and extend Three Gems plugins.
          </p>

          <div className="mt-8 relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search documentation…"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 pt-10 pb-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.title}
            href="/docs"
            className="card-surface p-6 hover:-translate-y-0.5 hover:border-primary/40 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary grid place-items-center">
              <s.icon className="w-5 h-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 pb-16">
        <div className="card-surface p-8">
          <h3 className="font-display text-xl font-bold">Quick install</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Upload the plugin .zip from your account and activate it via WordPress admin.
          </p>
          <pre className="mt-4 rounded-xl bg-primary-deep text-rose-100 text-sm p-5 overflow-x-auto font-mono">
{`# WP-CLI
wp plugin install threegems-payment-automation.zip --activate
wp option update threegems_license_key "YOUR-LICENSE-KEY"`}
          </pre>
        </div>
      </section>
    </div>
  );
}
