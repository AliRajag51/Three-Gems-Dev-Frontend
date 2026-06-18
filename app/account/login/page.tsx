"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Gem } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/schema/auth.schema";
import { Field, FieldError, PasswordInput } from "@/components/auth/form-helpers";
import { useLogin } from "@/lib/hooks/auth.hooks";
import { useAuth } from "@/lib/context/auth.context";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { mutate: submitLogin, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormData) => {
    submitLogin(data, {
      onSuccess: (res) => {
        setUser(res.data?.user ?? res);
        router.push("/");
      },
    });
  };

  return (
    <div className="mx-auto max-w-md px-5 lg:px-8 py-10 min-h-[calc(100svh-4rem)] flex flex-col justify-center">
      <div className="text-center">
        <span className="grid place-items-center w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary-deep text-white shadow-lg">
          <Gem className="w-6 h-6" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to manage your licenses
        </p>
      </div>

      <div className="mt-8 card-surface p-7">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          autoComplete="off"
        >
          <Field label="Email">
            <input
              type="email"
              placeholder="you@store.com"
              autoComplete="email"
              {...register("email")}
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
            />
            <FieldError message={errors.email?.message} />
          </Field>

          <Field label="Password">
            <PasswordInput
              placeholder="••••••••"
              autoComplete="current-password"
              visible={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              {...register("password")}
            />
            <FieldError message={errors.password?.message} />
          </Field>

          <div className="text-right">
            <Link
              href="/account/forgot-password"
              className="text-xs font-semibold text-primary"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-ruby w-full px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Three Gems?{" "}
          <Link href="/account/signup" className="text-primary font-semibold">
            Create an account
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link href="/about" className="underline">
          Terms
        </Link>
        .
      </p>
    </div>
  );
}
