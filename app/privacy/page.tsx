import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Three Gems",
  description:
    "How Three Gems collects, uses, and protects your information when you use our website, plugins, and services.",
};

// The date this policy was last revised. Update it whenever the policy changes.
const LAST_UPDATED = "June 14, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div>
      <section className="hero-bg">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-16 lg:pt-20 pb-8 lg:pb-10">
          <span className="chip">Legal</span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 pt-6 lg:pt-8 pb-16">
        <p className="text-sm leading-relaxed text-muted-foreground">
          This Privacy Policy explains how <strong>Three Gems</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
          &ldquo;our&rdquo;) collects, uses, and protects your information when you visit our website, create an
          account, and purchase or use our WordPress and WooCommerce plugins (the &ldquo;Service&rdquo;). By using
          the Service, you agree to the practices described here.
        </p>

        <Section title="1. Information we collect">
          <p>We collect only what we need to run the Service:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Account details</strong> — your name, email address, and a securely hashed password.</li>
            <li><strong>Purchase &amp; license data</strong> — the plugins and plans you buy, order and subscription records, license keys, site activations, amounts paid, and the country you select at checkout.</li>
            <li><strong>Payment information</strong> — payments are processed by PayPal. We do <strong>not</strong> see or store your full card or bank details; we only receive a confirmation and reference for your transaction.</li>
            <li><strong>Technical data</strong> — your IP address (used to detect your approximate country and to help keep accounts secure), browser/device information, and cookies needed to sign you in.</li>
            <li><strong>Support &amp; contact messages</strong> — anything you send us through support tickets or the contact form.</li>
          </ul>
        </Section>

        <Section title="2. How we use your information">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To provide the Service — deliver downloads and updates, validate license keys, and manage your subscriptions.</li>
            <li>To process payments, renewals, and refunds through PayPal.</li>
            <li>To send you essential emails such as purchase confirmations, renewal notices, and replies to your support requests.</li>
            <li>To provide customer support and respond to your enquiries.</li>
            <li>To understand and improve the Service, including anonymous, aggregated insights such as which countries our customers buy from.</li>
            <li>To protect the Service against fraud and abuse, and to comply with our legal and tax obligations.</li>
          </ul>
          <p>We do <strong>not</strong> sell your personal information.</p>
        </Section>

        <Section title="3. Cookies &amp; sessions">
          <p>
            We use a small number of essential cookies to keep you signed in and to keep your session secure.
            These are required for the Service to work and are not used for advertising.
          </p>
        </Section>

        <Section title="4. Third-party services">
          <p>We rely on a few trusted providers to operate the Service. Each only receives the data needed for its function:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>PayPal</strong> — to process one-time and recurring payments.</li>
            <li><strong>Email delivery provider</strong> — to send transactional emails (confirmations, renewals, support).</li>
            <li><strong>Cloud storage (Cloudflare R2)</strong> — to host plugin files, icons, and screenshots you download.</li>
            <li><strong>Hosting &amp; database providers</strong> — to securely run our application and store your account and order data.</li>
          </ul>
          <p>These providers have their own privacy policies governing how they handle data.</p>
        </Section>

        <Section title="5. Data retention">
          <p>
            We keep your account and purchase records for as long as your account is active and for as long as we
            need them to provide the Service or to meet legal, accounting, and tax requirements. You can ask us to
            delete your account at any time (see your rights below), subject to records we must legally retain.
          </p>
        </Section>

        <Section title="6. Your rights">
          <p>Depending on where you live, you may have the right to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Access the personal information we hold about you.</li>
            <li>Correct information that is inaccurate or out of date.</li>
            <li>Request deletion of your personal information.</li>
            <li>Object to or restrict certain processing, and request a copy of your data.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us using the details below — we&apos;ll respond within a
            reasonable time.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            We protect your data with industry-standard measures: encryption in transit (HTTPS), hashed passwords,
            and restricted access to systems that hold personal information. No method of transmission or storage is
            ever 100% secure, but we work hard to safeguard your information.
          </p>
        </Section>

        <Section title="8. Children's privacy">
          <p>
            The Service is intended for businesses and adults. It is not directed to children, and we do not
            knowingly collect personal information from anyone under 16.
          </p>
        </Section>

        <Section title="9. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we&apos;ll revise the &ldquo;Last
            updated&rdquo; date at the top of this page. Significant changes will be communicated where appropriate.
          </p>
        </Section>

        <Section title="10. Contact us">
          <p>
            If you have any questions about this Privacy Policy or how we handle your data, reach out at{" "}
            <a href="mailto:support@threegems.com" className="text-primary font-semibold hover:underline">support@threegems.com</a>{" "}
            or through our{" "}
            <Link href="/contact" className="text-primary font-semibold hover:underline">Contact page</Link>.
          </p>
        </Section>
      </section>
    </div>
  );
}
