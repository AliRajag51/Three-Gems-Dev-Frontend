import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Gem } from "lucide-react";

export const Route = createFileRoute("/account")({
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

function AccountPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
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

      <div className="mt-8 card-surface p-7">
        <form className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-sm font-semibold">Full name</label>
              <input className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary" />
            </div>
          )}
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              type="email"
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Password</label>
            <input
              type="password"
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
            />
          </div>
          {mode === "login" && (
            <div className="text-right">
              <a href="#" className="text-xs font-semibold text-primary">
                Forgot password?
              </a>
            </div>
          )}
          <button
            type="button"
            className="btn-ruby w-full px-5 py-3 rounded-xl text-sm font-semibold"
          >
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? "New to Three Gems?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-primary font-semibold"
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
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
