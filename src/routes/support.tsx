import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, MessagesSquare, BookOpen, Mail } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — Three Gems" },
      { name: "description", content: "Get fast, expert help from the Three Gems support team." },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <div>
      <section className="hero-bg">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16 lg:py-20">
          <span className="chip">Support</span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">We're here when you need us</h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">Real engineers, real answers. Average first response under 6 hours.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-12 grid gap-5 lg:grid-cols-3">
        {[
          { icon: BookOpen, title: "Browse the docs", text: "Step-by-step guides, API reference, and tutorials.", to: "/docs" as const, cta: "Open docs" },
          { icon: LifeBuoy, title: "Open a ticket", text: "Premium support included with every active license.", to: "/contact" as const, cta: "Submit ticket" },
          { icon: MessagesSquare, title: "Community", text: "Chat with other Three Gems builders and store owners.", to: "/contact" as const, cta: "Join community" },
        ].map((c) => (
          <div key={c.title} className="card-surface p-6">
            <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary grid place-items-center">
              <c.icon className="w-5 h-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">{c.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{c.text}</p>
            <Link to={c.to} className="mt-4 inline-block text-sm font-semibold text-primary">{c.cta} →</Link>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 pb-16">
        <div className="card-surface p-8 lg:p-10 grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="font-display text-2xl font-bold">Submit a support request</h3>
            <p className="mt-2 text-sm text-muted-foreground">Make sure you're signed in with the email associated with your license. We'll reply within 6 hours on business days.</p>
            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
              <Mail className="w-4 h-4 text-primary" /> support@threegems.com
            </div>
          </div>
          <form className="space-y-4">
            <Field label="Your email" type="email" placeholder="you@store.com" />
            <Field label="License key" placeholder="TG-XXXX-XXXX-XXXX" />
            <div>
              <label className="text-sm font-semibold">Message</label>
              <textarea rows={5} placeholder="What can we help with?" className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary" />
            </div>
            <button type="button" className="btn-ruby px-5 py-3 rounded-xl text-sm font-semibold">Send message</button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input {...rest} className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary" />
    </div>
  );
}
