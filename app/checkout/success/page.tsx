"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

function SuccessContent() {
  const params = useSearchParams();
  const slug = params.get("plugin");
  const pending = params.get("pending") === "1";

  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      {pending ? (
        <>
          <Loader2 className="mx-auto w-16 h-16 text-primary animate-spin" />
          <h1 className="mt-6 font-display text-3xl font-bold">Payment received — finalizing…</h1>
          <p className="mt-3 text-muted-foreground">
            Your payment went through and we&apos;re activating your license now. This can take a
            minute. Refresh the plugin page shortly to see your license key and download.
          </p>
        </>
      ) : (
        <>
          <CheckCircle className="mx-auto w-16 h-16 text-primary" />
          <h1 className="mt-6 font-display text-3xl font-bold">Payment successful!</h1>
          <p className="mt-3 text-muted-foreground">
            Your license is now active. Open the plugin page to copy your license key and download the plugin.
          </p>
        </>
      )}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={slug ? `/plugins/${slug}` : "/plugins"}
          className="btn-ruby px-6 py-3 rounded-xl text-sm font-semibold"
        >
          {slug ? "View your license" : "Browse plugins"}
        </Link>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-surface transition-colors"
        >
          Go to homepage
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
