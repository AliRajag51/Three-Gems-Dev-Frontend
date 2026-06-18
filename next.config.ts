import type { NextConfig } from "next";

// Origin of the backend API. Kept server-side here so the browser only ever talks to
// THIS Next app — requests to /api/* are proxied to the backend below. That makes the
// backend's auth cookie first-party to the frontend domain, so Chrome/Brave (which
// block third-party cookies) accept and persist it.
const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN ||
  process.env.NEXT_PUBLIC_CLIENT_BASE_URL ||
  "https://tg.ogolivagency.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
