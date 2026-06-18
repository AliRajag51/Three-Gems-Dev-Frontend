import { Mail } from "lucide-react";
import { SupportForm } from "./_components/support-form";

export const metadata = {
  title: "Support — Three Gems",
  description: "Get fast, expert help from the Three Gems support team.",
};

export default function SupportPage() {
  return (
    <div>
      <section className="hero-bg">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-16 lg:pt-20 pb-8 lg:pb-10">
          <span className="chip">Support</span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            We&apos;re here when you need us
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Real engineers, real answers. Average first response under 6 hours.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 pt-6 lg:pt-8 pb-12 lg:pb-16">
        <div className="card-surface p-8 lg:p-10 grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="font-display text-2xl font-bold">Submit a support request</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Make sure you&apos;re signed in with the email associated with your license.
              We&apos;ll reply within 6 hours on business days.
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
              <Mail className="w-4 h-4 text-primary" /> support@threegems.com
            </div>
          </div>
          <SupportForm />
        </div>
      </section>
    </div>
  );
}
