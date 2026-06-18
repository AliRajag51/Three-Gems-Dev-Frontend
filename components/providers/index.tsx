import React from "react";
import { Toaster } from "sonner";
import QueryProvider from "./QueryProvider";
import { AuthProvider } from "@/lib/context/auth.context";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <AuthProvider>
        <ConfirmProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </ConfirmProvider>
      </AuthProvider>
    </QueryProvider>
  );
};

export default Providers;
