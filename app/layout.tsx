import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Three Gems — Premium WooCommerce Plugins",
  description:
    "Three Gems builds powerful, reliable WordPress and WooCommerce plugins for serious store owners, agencies, and developers.",
  openGraph: {
    title: "Three Gems — Premium WooCommerce Plugins",
    description: "Powerful WooCommerce plugins built for serious stores.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

import Providers from "@/components/providers";
import { SiteShell } from "@/components/site-shell";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
