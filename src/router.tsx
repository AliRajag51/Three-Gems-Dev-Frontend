import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { ApiError } from "@/lib/api/client";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // Sensible defaults for the whole app:
  //   - 1-minute staleTime — most reads are cheap and changes are surfaced
  //     by explicit `invalidateQueries` calls after mutations
  //   - No automatic retry on 4xx — those are application errors, not flakes;
  //     retrying a 401/403/404 just wastes round trips
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: (failureCount, err) => {
          if (err instanceof ApiError && err.status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
