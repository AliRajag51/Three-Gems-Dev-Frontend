/**
 * The single source of truth for "who is the current user?" across the app.
 *
 * Backed by TanStack Query so:
 *   - Every component that reads it gets the same cached value (no prop-drilling)
 *   - After sign-in / sign-out, calling `invalidate()` updates every consumer
 *   - `isAuthenticated` is computed; consumers can branch on it without dealing
 *     with the loading-vs-anonymous-vs-error distinction unless they want to
 *
 * 401 from /api/v1/me is normal (= "not logged in"); we map it to `user: null`
 * instead of treating it as an error so the UI doesn't have to do `error.status === 401`.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { MePublic } from "@/lib/api/types";

export const SESSION_QUERY_KEY = ["session"] as const;

interface SessionState {
  user: MePublic | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => Promise<unknown>;
}

export function useSession(): SessionState {
  const query = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    refetch: () => query.refetch(),
  };
}

/**
 * Imperatively refresh the session cache. Call after sign-in / sign-out.
 *
 * Uses `refetchQueries` (NOT just `invalidateQueries`) so the returned
 * promise resolves only after `/api/v1/me` has actually been re-fetched.
 * Callers that `await` this can safely navigate immediately afterwards
 * and the header / `<RequireAuth>` will see the new auth state on the
 * very next render — no stale-`null` flash.
 */
export function useInvalidateSession() {
  const qc = useQueryClient();
  return () => qc.refetchQueries({ queryKey: SESSION_QUERY_KEY, exact: true });
}

/**
 * Optimistic helper: drop a freshly-known user (or `null` on sign-out) into
 * the session cache without a network round-trip. Use when an auth mutation
 * already gave us the user payload — e.g. Better-Auth's sign-in returns
 * `{ user, token }` so there's no reason to refetch `/api/v1/me`.
 */
export function useSetSessionUser() {
  const qc = useQueryClient();
  return (user: MePublic | null) => qc.setQueryData(SESSION_QUERY_KEY, user);
}
