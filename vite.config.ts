import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    nitro(),
    viteReact(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
    dedupe: [
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@tanstack/router-core",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  // Dev-only proxy: forward /api/* to the backend so the browser sees same-origin
  // requests. This lets Better-Auth's session cookies (httpOnly, SameSite=Lax)
  // flow without CORS preflights or third-party-cookie restrictions. In
  // production the frontend talks to a real API host configured via
  // VITE_API_URL; see src/lib/api/client.ts.
  //
  // Port is pinned to 5173 because the backend NestJS dev server lives on 3000.
  // If we don't pin, Vite's default behavior on this template lands it on 3000
  // and the two servers fight (Windows allows the double-bind but routes
  // requests randomly between them).
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: false, // keep the original Origin header so backend CORS allow-list still applies
        secure: false,
      },
    },
  },
});
