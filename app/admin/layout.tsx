"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useAuth } from "@/lib/context/auth.context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Admin authorization happens here on the client, not in proxy.ts. The auth cookie
  // is httpOnly and lives on the backend domain, so the Vercel frontend server can't
  // read it — but AuthProvider verifies the session via /users/me and gives us `user`.
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/account/login?redirect=/admin");
    } else if (!user.isAdmin) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  // Don't flash the admin UI while we're verifying or redirecting a non-admin.
  if (isLoading || !user || !user.isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      {/* pt-14 clears the fixed mobile top bar; the desktop rail has no top bar. */}
      <div className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0">
        {children}
      </div>
    </div>
  );
}
