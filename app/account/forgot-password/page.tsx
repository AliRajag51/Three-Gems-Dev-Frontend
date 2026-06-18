"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Gem } from "lucide-react";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from "@/lib/schema/auth.schema";
import { Field, FieldError, PasswordInput } from "@/components/auth/form-helpers";
import { useForgotPassword, useResetPassword } from "@/lib/hooks/auth.hooks";

type Step = "email" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate: submitForgot, isPending: isSendingOtp } = useForgotPassword();
  const { mutate: submitReset, isPending: isResetting } = useResetPassword();

  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  const onSendOtp = (data: ForgotPasswordFormData) => {
    submitForgot(data, {
      onSuccess: () => {
        setEmail(data.email);
        setStep("reset");
      },
    });
  };

  const onResetPassword = (data: ResetPasswordFormData) => {
    submitReset(
      { otp: data.otp, newPassword: data.newPassword },
      {
        onSuccess: () => {
          router.push("/account/login");
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-md px-5 lg:px-8 py-16 lg:py-24">
      <div className="text-center">
        <span className="grid place-items-center w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary-deep text-white shadow-lg">
          <Gem className="w-6 h-6" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold">
          {step === "email" ? "Forgot password" : "Reset password"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {step === "email"
            ? "Enter your email and we'll send you a code"
            : `Enter the 6-digit code sent to ${email}`}
        </p>
      </div>

      <div className="mt-8 card-surface p-7">
        {step === "email" ? (
          <form
            onSubmit={emailForm.handleSubmit(onSendOtp)}
            className="space-y-4"
            autoComplete="off"
          >
            <Field label="Email">
              <input
                type="email"
                placeholder="you@store.com"
                autoComplete="email"
                {...emailForm.register("email")}
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
              />
              <FieldError message={emailForm.formState.errors.email?.message} />
            </Field>

            <button
              type="submit"
              disabled={isSendingOtp}
              className="btn-ruby w-full px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              {isSendingOtp ? "Sending code…" : "Send code"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={resetForm.handleSubmit(onResetPassword)}
            className="space-y-4"
            autoComplete="off"
          >
            <Field label="OTP code">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                {...resetForm.register("otp")}
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm tracking-[0.5em] text-center font-semibold focus:outline-none focus:border-primary"
              />
              <FieldError message={resetForm.formState.errors.otp?.message} />
            </Field>

            <Field label="New password">
              <PasswordInput
                placeholder="••••••••"
                autoComplete="new-password"
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                {...resetForm.register("newPassword")}
              />
              <FieldError
                message={resetForm.formState.errors.newPassword?.message}
              />
            </Field>

            <Field label="Confirm password">
              <PasswordInput
                placeholder="••••••••"
                autoComplete="new-password"
                visible={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                {...resetForm.register("confirmPassword")}
              />
              <FieldError
                message={resetForm.formState.errors.confirmPassword?.message}
              />
            </Field>

            <button
              type="submit"
              disabled={isResetting}
              className="btn-ruby w-full px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              {isResetting ? "Resetting…" : "Reset password"}
            </button>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-primary"
            >
              ← Use a different email
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link href="/account/login" className="text-primary font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
