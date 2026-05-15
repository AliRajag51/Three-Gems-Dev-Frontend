/**
 * Wrap any subtree that requires an authenticated session. While the session
 * query is in flight we show a centered loader (cheap, brand-consistent);
 * if there's no user we redirect to /account with a `?redirect` hint so the
 * sign-in form can hand the user back here on success.
 *
 * Use case: <RequireAuth><LicensesDashboard /></RequireAuth>
 *
 * Why a component and not a route loader: the design-system / branding pieces
 * (loader styling, redirect URL building) belong with the rendering layer,
 * and React 19's `<Suspense>` handles the deferred render cleanly.
 */
import { Navigate, useLocation } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useSession } from "@/hooks/use-session";

interface RequireAuthProps {
  children: React.ReactNode;
  /** Where to send unauthenticated users. Default: /account. */
  redirectTo?: string;
}

export function RequireAuth({ children, redirectTo = "/account" }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useSession();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const search = { redirect: location.pathname + location.searchStr } as Record<string, string>;
    return <Navigate to={redirectTo} search={search} replace />;
  }

  return <>{children}</>;
}
