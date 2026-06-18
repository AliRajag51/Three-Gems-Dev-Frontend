import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type TokenPayload = {
  id: string;
  isAdmin: boolean;
  exp: number;
};

function decodeToken(token: string): TokenPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as TokenPayload;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const payload = token ? decodeToken(token) : null;
  const isValidToken = payload !== null && Date.now() < payload.exp * 1000;

  // Redirect already-logged-in users away from the auth pages.
  //
  // NOTE: the `/admin` guard was removed from here on purpose. proxy.ts runs on the
  // FRONTEND server (Vercel). The `accessToken` cookie is httpOnly and scoped to the
  // BACKEND domain (tg.ogolivagency.com), so it is invisible to the Vercel domain —
  // this code can never read it in production, and the old guard redirected every
  // admin to /account/login. Admin authorization now lives client-side in
  // app/admin/layout.tsx, which reads the user from /users/me. The backend's
  // requireAdmin middleware remains the real security boundary.
  if (isValidToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/login", "/account/signup"],
};
