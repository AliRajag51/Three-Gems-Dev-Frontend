import { Outlet, createRootRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-[60vh] grid place-items-center px-5">
      <div className="text-center">
        <p className="text-7xl font-display font-bold text-primary">404</p>
        <p className="mt-3 text-xl font-semibold">Page not found</p>
        <a href="/" className="btn-ruby inline-block mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold">Back home</a>
      </div>
    </div>
  ),
});
