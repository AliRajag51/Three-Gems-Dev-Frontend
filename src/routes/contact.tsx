import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Building2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Three Gems" },
      { name: "description", content: "Get in touch with the Three Gems team for sales, support, or partnership inquiries." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div>
      <section className="hero-bg">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16 lg:py-20">
          <span className="chip">Contact</span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">Let's talk</h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">Sales questions, custom work, partnerships — drop us a line.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-12 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-surface p-8">
          <h3 className="font-display text-xl font-bold">Send us a message</h3>
          <form className="mt-6 grid gap-4 sm:grid-cols-2">
            <Input label="Name" />
            <Input label="Email" type="email" />
            <Input label="Company" wrap />
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold">Subject</label>
              <select className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary">
                <option>Sales inquiry</option>
                <option>Agency / bundle pricing</option>
                <option>Partnership</option>
                <option>Other</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold">Message</label>
              <textarea rows={6} className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary" />
            </div>
            <button type="button" className="btn-ruby sm:col-span-2 px-5 py-3 rounded-xl text-sm font-semibold">Send message</button>
          </form>
        </div>
        <div className="space-y-4">
          {[
            { icon: Mail, t: "Email", d: "hello@threegems.com" },
            { icon: MessageCircle, t: "Live chat", d: "Mon–Fri, 9am–6pm GMT" },
            { icon: Building2, t: "Headquarters", d: "Remote · serving stores worldwide" },
          ].map((c) => (
            <div key={c.t} className="card-surface p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0"><c.icon className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-semibold">{c.t}</p>
                <p className="text-sm text-muted-foreground">{c.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Input({ label, wrap, ...rest }: { label: string; wrap?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={wrap ? "sm:col-span-2" : ""}>
      <label className="text-sm font-semibold">{label}</label>
      <input {...rest} className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary" />
    </div>
  );
}
