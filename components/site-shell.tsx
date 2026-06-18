"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith("/admin");

  if (hideChrome) return <>{children}</>;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
