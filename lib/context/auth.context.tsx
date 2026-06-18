"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/services";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const stored = localStorage.getItem("tg_user");

    // Optimistically hydrate from cache (if any) so user-dependent queries
    // (e.g. licenses) can fire immediately instead of waiting for /users/me.
    if (stored) {
      try {
        setUserState(JSON.parse(stored));
      } catch {
        localStorage.removeItem("tg_user");
      }
    }

    // Always confirm against the server session — the httpOnly cookie is the
    // source of truth, so verify even with no cached user. This lets the
    // refresh-token interceptor restore a valid session (e.g. after the access
    // token expired, or on a fresh tab where localStorage was cleared).
    api
      .get("/users/me")
      .then((res) => {
        const freshUser = res.data.data.user;
        setUserState(freshUser);
        localStorage.setItem("tg_user", JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem("tg_user");
        setUserState(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
    if (u) localStorage.setItem("tg_user", JSON.stringify(u));
    else localStorage.removeItem("tg_user");
  };

  const logout = () => {
    setUser(null);
    // Drop user-scoped cached data so it can't leak into the logged-out UI
    // (e.g. "Owned" badges derived from the previous user's licenses).
    queryClient.removeQueries({ queryKey: ["my-licenses"] });
    queryClient.removeQueries({ queryKey: ["my-subscriptions"] });
    queryClient.removeQueries({ queryKey: ["me"] });
    // The catalog includes PRIVATE plugins/plans the previous session was allowed
    // to see. With staleTime, re-logging in within 60s would re-serve that cached
    // list (private cards and all) instead of refetching — so evict it on logout
    // to force a fresh, correctly-filtered fetch for the next session.
    queryClient.removeQueries({ queryKey: ["plugins"] });
    queryClient.removeQueries({ queryKey: ["plugin"] });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
