/**
 * Auth API surface. Wraps Better-Auth's /api/v1/auth/* routes.
 *
 * Better-Auth sets a session cookie on sign-in/sign-up; we don't need to
 * handle the token ourselves. The `MePublic` projection comes from our own
 * /api/v1/me endpoint (UsersController).
 */
import { api } from "./client";
import type { AuthResponse, MePublic } from "./types";

const AUTH_BASE = "/api/v1/auth";

export const authApi = {
  /**
   * POST /api/v1/auth/sign-up/email — creates account, sends verification email.
   *
   * Pass `callbackURL` to control where Better-Auth redirects after the user
   * clicks the verification link in their inbox. We default to landing them
   * back on the frontend's /account page with `?verified=1` so the route
   * can show a "Email verified, please sign in" banner.
   */
  signUp(input: { email: string; password: string; name: string; callbackURL?: string }) {
    const callbackURL =
      input.callbackURL ??
      (typeof window !== "undefined"
        ? `${window.location.origin}/account?verified=1`
        : "/account?verified=1");
    return api.post<AuthResponse>(`${AUTH_BASE}/sign-up/email`, { ...input, callbackURL });
  },

  /** POST /api/v1/auth/sign-in/email — sets the session cookie on success. */
  signIn(input: { email: string; password: string }) {
    return api.post<AuthResponse>(`${AUTH_BASE}/sign-in/email`, input);
  },

  /** POST /api/v1/auth/sign-out — clears the session cookie server-side. */
  signOut() {
    return api.post(`${AUTH_BASE}/sign-out`);
  },

  /** GET /api/v1/auth/verify-email?token=... — Better-Auth issues 302 redirects on success. */
  verifyEmailUrl(token: string, callbackURL = "/account") {
    const url = new URL(`${AUTH_BASE}/verify-email`, window.location.origin);
    url.searchParams.set("token", token);
    url.searchParams.set("callbackURL", callbackURL);
    return url.toString();
  },

  /** POST /api/v1/auth/request-password-reset — emails the user a reset link. */
  requestPasswordReset(input: { email: string; redirectTo?: string }) {
    return api.post(`${AUTH_BASE}/request-password-reset`, input);
  },

  /** POST /api/v1/auth/reset-password — submits new password with the token from the email link. */
  resetPassword(input: { token: string; newPassword: string }) {
    return api.post(`${AUTH_BASE}/reset-password`, input);
  },

  /** GET /api/v1/me — returns the current user; throws 401 if unauthenticated. */
  me() {
    return api.get<MePublic>("/api/v1/me");
  },
};
