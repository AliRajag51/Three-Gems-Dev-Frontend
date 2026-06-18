"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Gem } from "lucide-react";
import {
  signupInitSchema,
  signupVerifySchema,
  type SignupInitFormData,
  type SignupVerifyFormData,
} from "@/lib/schema/auth.schema";
import { Field, FieldError, PasswordInput } from "@/components/auth/form-helpers";
import { useRegisterInit, useRegisterVerify } from "@/lib/hooks/auth.hooks";
import { useAuth } from "@/lib/context/auth.context";

type Step = "details" | "verify";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [step, setStep] = useState<Step>("details");
  const [email, setEmail] = useState("");
  const [show, setShow] = useState({ password: false, confirm: false });
  const toggle = (field: keyof typeof show) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const { mutate: submitInit, isPending: isSendingOtp } = useRegisterInit();
  const { mutate: submitVerify, isPending: isVerifying } = useRegisterVerify();

  const detailsForm = useForm<SignupInitFormData>({
    resolver: zodResolver(signupInitSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "" },
  });

  const verifyForm = useForm<SignupVerifyFormData>({
    resolver: zodResolver(signupVerifySchema),
    mode: "onChange",
    defaultValues: { otp: "", password: "", confirmPassword: "" },
  });

  const onSendOtp = (data: SignupInitFormData) => {
    submitInit(data, {
      onSuccess: () => {
        setEmail(data.email);
        setStep("verify");
      },
    });
  };

  const onVerify = (data: SignupVerifyFormData) => {
    submitVerify(
      { otp: data.otp, password: data.password },
      {
        onSuccess: (res) => {
          setUser(res.data?.user ?? res);
          router.push("/");
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-md px-5 lg:px-8 py-10 min-h-[calc(100svh-4rem)] flex flex-col justify-center">
      <div className="text-center">
        <span className="grid place-items-center w-12 h-12 mx-auto rounded-2xl bg-linear-to-br from-primary to-primary-deep text-white shadow-lg">
          <Gem className="w-6 h-6" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold">
          {step === "details" ? "Create your account" : "Verify your email"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {step === "details"
            ? "Start using Three Gems plugins today"
            : `Enter the 6-digit code sent to ${email}`}
        </p>
      </div>

      <div className="mt-8 card-surface p-7">
        {step === "details" ? (
          <form
            onSubmit={detailsForm.handleSubmit(onSendOtp)}
            className="space-y-4"
            autoComplete="off"
          >
            <Field label="Full name">
              <input
                type="text"
                placeholder="Ahmed Khan"
                autoComplete="name"
                {...detailsForm.register("name")}
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
              />
              <FieldError message={detailsForm.formState.errors.name?.message} />
            </Field>

            <Field label="Email">
              <input
                type="email"
                placeholder="you@store.com"
                autoComplete="email"
                {...detailsForm.register("email")}
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
              />
              <FieldError message={detailsForm.formState.errors.email?.message} />
            </Field>

            <button
              type="submit"
              disabled={isSendingOtp}
              className="btn-ruby w-full px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              {isSendingOtp ? "Sending code…" : "Continue"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={verifyForm.handleSubmit(onVerify)}
            className="space-y-4"
            autoComplete="off"
          >
            <Field label="OTP code">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                {...verifyForm.register("otp")}
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm tracking-[0.5em] text-center font-semibold focus:outline-none focus:border-primary"
              />
              <FieldError message={verifyForm.formState.errors.otp?.message} />
            </Field>

            <Field label="Password">
              <PasswordInput
                placeholder="••••••••"
                autoComplete="new-password"
                visible={show.password}
                onToggle={() => toggle("password")}
                {...verifyForm.register("password")}
              />
              <FieldError message={verifyForm.formState.errors.password?.message} />
            </Field>

            <Field label="Confirm password">
              <PasswordInput
                placeholder="••••••••"
                autoComplete="new-password"
                visible={show.confirm}
                onToggle={() => toggle("confirm")}
                {...verifyForm.register("confirmPassword")}
              />
              <FieldError
                message={verifyForm.formState.errors.confirmPassword?.message}
              />
            </Field>

            <button
              type="submit"
              disabled={isVerifying}
              className="btn-ruby w-full px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              {isVerifying ? "Creating account…" : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => setStep("details")}
              className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-primary"
            >
              ← Use a different email
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/account/login" className="text-primary font-semibold">
            Sign in
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
