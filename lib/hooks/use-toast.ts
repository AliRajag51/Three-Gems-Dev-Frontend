"use client";

import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

function toast({ title, description, variant }: ToastOptions) {
  const message = title ?? description ?? "";
  const detail = title && description ? description : undefined;

  if (variant === "destructive") {
    sonnerToast.error(message, { description: detail });
  } else {
    sonnerToast.success(message, { description: detail });
  }
}

function useToast() {
  return { toast };
}

export { useToast, toast };
