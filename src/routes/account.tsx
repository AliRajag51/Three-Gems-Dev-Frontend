/**
 * /account — the sign-in / sign-up page.
 *
 * Backed by TanStack Form (with Zod 3 Standard Schema validators) and TanStack
 * Query's `useMutation` so loading + error states behave like the rest of the
 * app. On success we invalidate the session cache so the header + every other
 * consumer of `useSession` pick up the new auth state without a page reload.
 *
 * Mode UX (`login` ↔ `signup`) is preserved from the previous static version.
 * Note: after sign-up we DO NOT auto-redirect — Better-Auth requires email
 * verification first — we just render a "check your inbox" success state.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Gem, Loader2, MailCheck, CheckCircle2 } from "lucide-react";

import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useInvalidateSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AccountSearch {
  redirect?: string;
  verified?: boolean;
}

export const Route = createFileRoute("/account")({
  validateSearch: (s: Record<string, unknown>): AccountSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
    verified: s.verified === "1" || s.verified === true ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Account — Three Gems" },
      {
        name: "description",
        content: "Sign in to your Three Gems account to manage licenses and downloads.",
      },
    ],
  }),
  component: AccountPage,
});

type Mode = "login" | "signup";

const emailSchema = z.string().min(1, "Email is required").email("Enter a valid email address");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");
const nameSchema = z.string().min(1, "Name is required").max(100, "Name is too long");

function AccountPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<Mode>("login");
  const [signedUpEmail, setSignedUpEmail] = useState<string | null>(null);

  if (signedUpEmail) {
    return (
      <SignUpSuccess
        email={signedUpEmail}
        onBackToSignIn={() => {
          setSignedUpEmail(null);
          setMode("login");
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 lg:px-8 py-16 lg:py-24">
      <div className="text-center">
        <span className="grid place-items-center w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary-deep text-white shadow-lg">
          <Gem className="w-6 h-6" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {mode === "login"
            ? "Sign in to manage your licenses"
            : "Start using Three Gems plugins today"}
        </p>
      </div>

      {search.verified && (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
        >
          <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
          <p>Email verified — please sign in to continue.</p>
        </div>
      )}

      <div className="mt-8 card-surface p-7">
        {mode === "login" ? (
          <SignInForm redirectTo={search.redirect ?? "/"} onSwitchMode={() => setMode("signup")} />
        ) : (
          <SignUpForm
            onSuccess={(email) => setSignedUpEmail(email)}
            onSwitchMode={() => setMode("login")}
          />
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link to="/about" className="underline">
          Terms
        </Link>
        .
      </p>
    </div>
  );
}

/* ---------------- Sign-in ---------------- */

function SignInForm({
  redirectTo,
  onSwitchMode,
}: {
  redirectTo: string;
  onSwitchMode: () => void;
}) {
  const navigate = useNavigate();
  const invalidateSession = useInvalidateSession();

  const mutation = useMutation({
    mutationFn: (values: { email: string; password: string }) => authApi.signIn(values),
    onSuccess: async () => {
      await invalidateSession();
      // Allow internal paths only; otherwise fall back home.
      const target = redirectTo.startsWith("/") ? redirectTo : "/";
      navigate({ to: target });
    },
  });

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onSubmit: z.object({ email: emailSchema, password: passwordSchema }),
    },
    onSubmit: ({ value }) => mutation.mutateAsync(value),
  });

  const errorMessage = errorToMessage(mutation.error);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className="space-y-4"
      noValidate
    >
      {errorMessage && <ErrorBanner message={errorMessage} />}

      <form.Field name="email">
        {(field) => (
          <FieldShell
            label="Email"
            htmlFor={field.name}
            error={firstError(field.state.meta.errors)}
          >
            <Input
              id={field.name}
              type="email"
              autoComplete="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={mutation.isPending}
            />
          </FieldShell>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <FieldShell
            label="Password"
            htmlFor={field.name}
            error={firstError(field.state.meta.errors)}
          >
            <Input
              id={field.name}
              type="password"
              autoComplete="current-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={mutation.isPending}
            />
          </FieldShell>
        )}
      </form.Field>

      <Button
        type="submit"
        className="btn-ruby w-full px-5 py-3 h-auto rounded-xl text-sm font-semibold"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New to Three Gems?{" "}
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-primary font-semibold"
          disabled={mutation.isPending}
        >
          Create an account
        </button>
      </p>
    </form>
  );
}

/* ---------------- Sign-up ---------------- */

function SignUpForm({
  onSuccess,
  onSwitchMode,
}: {
  onSuccess: (email: string) => void;
  onSwitchMode: () => void;
}) {
  const mutation = useMutation({
    mutationFn: (values: { name: string; email: string; password: string }) =>
      authApi.signUp(values),
    onSuccess: (_data, vars) => onSuccess(vars.email),
  });

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    validators: {
      onSubmit: z.object({
        name: nameSchema,
        email: emailSchema,
        password: passwordSchema,
      }),
    },
    onSubmit: ({ value }) => mutation.mutateAsync(value),
  });

  const errorMessage = errorToMessage(mutation.error);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className="space-y-4"
      noValidate
    >
      {errorMessage && <ErrorBanner message={errorMessage} />}

      <form.Field name="name">
        {(field) => (
          <FieldShell
            label="Full name"
            htmlFor={field.name}
            error={firstError(field.state.meta.errors)}
          >
            <Input
              id={field.name}
              autoComplete="name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={mutation.isPending}
            />
          </FieldShell>
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <FieldShell
            label="Email"
            htmlFor={field.name}
            error={firstError(field.state.meta.errors)}
          >
            <Input
              id={field.name}
              type="email"
              autoComplete="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={mutation.isPending}
            />
          </FieldShell>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <FieldShell
            label="Password"
            htmlFor={field.name}
            error={firstError(field.state.meta.errors)}
            hint="At least 8 characters."
          >
            <Input
              id={field.name}
              type="password"
              autoComplete="new-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={mutation.isPending}
            />
          </FieldShell>
        )}
      </form.Field>

      <Button
        type="submit"
        className="btn-ruby w-full px-5 py-3 h-auto rounded-xl text-sm font-semibold"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-primary font-semibold"
          disabled={mutation.isPending}
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

/* ---------------- Sign-up success state ---------------- */

function SignUpSuccess({ email, onBackToSignIn }: { email: string; onBackToSignIn: () => void }) {
  return (
    <div className="mx-auto max-w-md px-5 lg:px-8 py-16 lg:py-24">
      <div className="text-center">
        <span className="grid place-items-center w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary-deep text-white shadow-lg">
          <MailCheck className="w-6 h-6" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold">Check your inbox</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We just sent a verification link to <span className="font-semibold">{email}</span>. Click
          it to activate your account, then come back to sign in.
        </p>
      </div>

      <div className="mt-8 card-surface p-7 text-center text-sm text-muted-foreground space-y-4">
        <p>
          The link expires in 24 hours. If you don't see the email, check your spam folder or try
          signing up again with the same address.
        </p>
        <Button type="button" variant="outline" className="w-full" onClick={onBackToSignIn}>
          Back to sign in
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Shared bits ---------------- */

function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      {message}
    </div>
  );
}

function errorToMessage(err: unknown): string | null {
  if (!err) return null;
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

function firstError(errors: ReadonlyArray<unknown>): string | undefined {
  for (const e of errors) {
    if (!e) continue;
    if (typeof e === "string") return e;
    if (typeof e === "object" && e !== null && "message" in e) {
      const m = (e as { message?: unknown }).message;
      if (typeof m === "string") return m;
    }
  }
  return undefined;
}
