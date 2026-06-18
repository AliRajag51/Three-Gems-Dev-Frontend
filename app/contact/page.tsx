import { Mail, MessageCircle, Building2 } from "lucide-react";
import { ContactForm } from "./_components/contact-form";

export const metadata = {
  title: "Contact — Three Gems",
  description:
    "Get in touch with the Three Gems team for sales, support, or partnership inquiries.",
};

const channels = [
  { icon: Mail, t: "Email", d: "hello@threegems.com" },
  { icon: MessageCircle, t: "Live chat", d: "Mon–Fri, 9am–6pm GMT" },
  { icon: Building2, t: "Headquarters", d: "Remote · serving stores worldwide" },
];

export default function ContactPage() {
  return (
    <div>
      <section className="hero-bg">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-16 lg:pt-20 pb-8 lg:pb-10">
          <span className="chip">Contact</span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Let&apos;s talk
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Sales questions, custom work, partnerships — drop us a line.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 pt-6 lg:pt-8 pb-12 lg:pb-16 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-surface p-8">
          <h3 className="font-display text-xl font-bold">Send us a message</h3>
          <ContactForm />
        </div>
        <div className="space-y-4">
          {channels.map((c) => (
            <div key={c.t} className="card-surface p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
                <c.icon className="w-5 h-5" />
              </div>
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
