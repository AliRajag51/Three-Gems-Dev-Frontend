"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Lock, X } from "lucide-react";

type Props = {
  onClose: () => void;
};

export function LoginRequiredModal({ onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm card-surface p-7 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto">
          <Lock className="w-6 h-6" />
        </span>

        <h2 className="mt-4 font-display text-xl font-bold">Sign in to purchase</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You need an account to buy a license. It only takes a minute.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/account/login"
            className="btn-ruby w-full px-5 py-3 rounded-xl text-sm font-semibold text-center"
          >
            Sign in
          </Link>
          <Link
            href="/account/signup"
            className="w-full px-5 py-3 rounded-xl text-sm font-semibold border border-border hover:border-primary hover:text-primary transition-colors text-center"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
