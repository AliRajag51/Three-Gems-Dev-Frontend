"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

export type ConfirmOptions = {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  hideCancel?: boolean; // single-button mode (use for read-only "view" dialogs)
};

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Imperative confirm — `const ok = await confirm({ ... })`. Resolves true/false. */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  useEffect(() => setMounted(true), []);

  const confirm = useCallback<ConfirmFn>((o) => {
    setOpts(o);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    setOpen(false);
    resolver.current?.(result);
    resolver.current = null;
  }, []);

  // Esc cancels + lock scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  const danger = opts?.tone === "danger";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {mounted &&
        open &&
        opts &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => close(false)} />
            <div role="dialog" aria-modal="true" className="relative w-full max-w-md card-surface p-6 shadow-2xl">
              <div className="flex flex-col items-center text-center gap-3">
                {danger && (
                  <span className="w-11 h-11 rounded-2xl bg-destructive/10 text-destructive grid place-items-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </span>
                )}
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold">{opts.title}</h2>
                  {opts.description && (
                    <div className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{opts.description}</div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse sm:flex-row justify-center gap-2">
                {!opts.hideCancel && (
                  <button
                    onClick={() => close(false)}
                    className="min-w-[10rem] px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-colors"
                  >
                    {opts.cancelLabel ?? "Cancel"}
                  </button>
                )}
                <button
                  onClick={() => close(true)}
                  autoFocus
                  className="btn-ruby min-w-[10rem] px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  {opts.confirmLabel ?? "Confirm"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </ConfirmContext.Provider>
  );
}
