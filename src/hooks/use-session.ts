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

/** Imperatively invalidate the session cache. Call after sign-in / sign-out. */
export function useInvalidateSession() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
}
