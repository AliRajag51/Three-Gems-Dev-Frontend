/**
 * /verify-email — the landing page Better-Auth sends users to from the
 * verification email link.
 *
 * We don't call the backend ourselves: Better-Auth's
 * GET /api/v1/auth/verify-email is a server route that flips
 * `emailVerified=true` and issues a 302 redirect to `callbackURL`. Doing it
 * client-side would mean an extra round-trip and lose the cookie-setting
 * behaviour. Instead we render a loader and immediately swap the browser
 * over to that backend URL via `window.location.href`.
 *
 * If Better-Auth sends the user back here with `?error=...` (e.g. invalid
 * or expired token) we render a friendly fallback instead. For v1 we don't
 * support resending the verification email — just point at /support.
 */
import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, MailWarning } from "lucide-react";

import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";

interface VerifyEmailSearch {
  token?: string;
  error?: string;
}

export const Route = createFileRoute("/verify-email")({
  validateSearch: (s: Record<string, unknown>): VerifyEmailSearch => ({
    token: typeof s.token === "string" ? s.token : undefined,
    error: typeof s.error === "string" ? s.error : undefined,
  }),
  head: () => ({
    meta: [{ title: "Verifying email — Three Gems" }, { name: "robots", content: "noindex" }],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token, error } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (error || !token) return;
    // Hand the browser off to Better-Auth's verify endpoint; it sets the
    // verified flag and redirects back to /account?verified=1.
    window.location.href = authApi.verifyEmailUrl(token, "/account?verified=1");
  }, [token, error]);

  // No token in the URL — the user clicked a malformed link.
  if (!token && !error) {
    return (
      <Fallback
        title="Missing verification token"
        body="This link is missing its verification token. Please open the most recent verification email and try again."
        onPrimary={() => navigate({ to: "/account" })}
        primaryLabel="Back to sign in"
      />
    );
  }

  if (error) {
    return (
      <Fallback
        title="Verification link invalid"
        body="Your verification link is invalid or has expired. Please contact support and we'll help you finish setting up your account."
        onPrimary={() => navigate({ to: "/support" })}
        primaryLabel="Contact support"
      />
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 lg:px-8 py-24 text-center">
      <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
      <h1 className="mt-6 font-display text-2xl font-bold">Verifying your email…</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Hang tight — we're confirming your account. You'll be redirected in a moment.
      </p>
    </div>
  );
}

function Fallback({
  title,
  body,
  primaryLabel,
  onPrimary,
}: {
  title: string;
  body: string;
  primaryLabel: string;
  onPrimary: () => void;
}) {
  return (
    <div className="mx-auto max-w-md px-5 lg:px-8 py-24 text-center">
      <span className="grid place-items-center w-12 h-12 mx-auto rounded-2xl bg-destructive/10 text-destructive">
        <MailWarning className="w-6 h-6" />
      </span>
      <h1 className="mt-4 font-display text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <div className="mt-6 flex flex-col gap-2">
        <Button
          type="button"
          className="btn-ruby h-auto py-3 rounded-xl font-semibold"
          onClick={onPrimary}
        >
          {primaryLabel}
        </Button>
        <Link to="/" className="text-xs font-medium text-muted-foreground hover:text-foreground">
          Back home
        </Link>
      </div>
    </div>
  );
}
