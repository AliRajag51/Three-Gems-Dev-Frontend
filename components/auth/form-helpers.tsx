"use client";

import { forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

export const PasswordInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    visible: boolean;
    onToggle: () => void;
  }
>(({ visible, onToggle, ...rest }, ref) => (
  <div className="relative mt-1.5">
    <input
      ref={ref}
      type={visible ? "text" : "password"}
      {...rest}
      className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      tabIndex={-1}
      aria-label={visible ? "Hide password" : "Show password"}
    >
      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  </div>
));
PasswordInput.displayName = "PasswordInput";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}
