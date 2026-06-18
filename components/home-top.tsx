"use client";

import { useAuth } from "@/lib/context/auth.context";
import { LoggedInStrip } from "@/components/logged-in-strip";

/**
 * Swaps the home page's top section based on auth:
 *  - signed in  → personalized "Welcome back" strip (real data)
 *  - signed out → the marketing hero + stats band (passed as children)
 *
 * We key off `user` (not `!isLoading`): the auth context hydrates `user` from
 * localStorage on mount within a tick, so on reload a logged-in visitor gets the
 * strip immediately instead of staring at the marketing hero for the whole
 * /users/me round-trip (which on a cold backend can take seconds). Logged-out
 * visitors keep `user === null`, so they see the marketing hero with no flash.
 * If a stale session later fails verification, the context clears `user` and we
 * fall back to the marketing hero.
 */
export function HomeTop({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user) return <LoggedInStrip />;
  return <>{children}</>;
}
