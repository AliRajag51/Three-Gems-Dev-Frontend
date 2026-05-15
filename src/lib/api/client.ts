/**
 * Shared HTTP client for the Three Gems backend.
 *
 * Wraps `fetch` with three responsibilities:
 *   1. Prefixes paths with the API base URL (dev: same-origin via Vite proxy;
 *      prod: VITE_API_URL).
 *   2. Always sends cookies (`credentials: "include"`) so Better-Auth's
 *      session cookie is on every request.
 *   3. Parses RFC 7807 problem+json responses into typed `ApiError` instances
 *      so callers can show the backend's `detail` field instead of generic
 *      "Something went wrong" copy.
 *
 * Every per-domain module under `src/lib/api/*` calls `apiFetch` — never
 * `fetch` directly — so the contract stays in one place.
 */

/**
 * Pick an API base URL that works in both browser and SSR contexts.
 *
 * - Browser: empty string → all paths stay relative ("/api/v1/...") and the
 *   Vite dev proxy or production rewrite handles the rest.
 * - SSR (TanStack Start's Nitro server): no `window` here. Reach the backend
 *   directly via the explicit `VITE_API_URL` env, or fall back to the local
 *   dev URL — which is the right answer because the SSR server runs on the
 *   same machine as the backend in dev.
 */
function getApiBase(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== "undefined") return ""; // relative — proxy handles it
  return "http://localhost:3000";
}

/** Shape Better-Auth + our backend exception filter return on non-2xx. */
export interface ApiProblem {
  type?: string;
  title?: string;
  status: number;
  code?: string;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly fieldErrors: Record<string, string[]> | undefined;
  readonly problem: ApiProblem;

  constructor(problem: ApiProblem) {
    super(problem.detail ?? problem.title ?? `Request failed (${problem.status})`);
    this.name = "ApiError";
    this.status = problem.status;
    this.code = problem.code;
    this.fieldErrors = problem.errors;
    this.problem = problem;
  }
}

export interface ApiFetchOptions extends RequestInit {
  /** JSON body — will be stringified and Content-Type set automatically. */
  json?: unknown;
  /** Query params — appended to the URL after URLSearchParams encoding. */
  searchParams?: Record<string, string | number | boolean | null | undefined>;
}

/**
 * Make an authenticated request to the backend.
 * Returns the parsed JSON response, or throws `ApiError` on non-2xx.
 *
 * 204 No Content responses resolve to `undefined`.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { json, searchParams, headers, ...rest } = options;

  // Build the URL string. Browser-side this is "/api/v1/..." (proxy applies);
  // SSR-side it's "http://localhost:3000/api/v1/...".
  let urlStr = path.startsWith("http") ? path : getApiBase() + path;
  if (searchParams) {
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v != null) usp.set(k, String(v));
    }
    const qs = usp.toString();
    if (qs) urlStr += (urlStr.includes("?") ? "&" : "?") + qs;
  }

  const finalHeaders = new Headers(headers);
  if (json !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
  }
  // Better-Auth sometimes hands non-JSON 200s (e.g. redirects); ask for JSON when sane.
  if (!finalHeaders.has("Accept")) {
    finalHeaders.set("Accept", "application/json");
  }

  const response = await fetch(urlStr, {
    ...rest,
    headers: finalHeaders,
    credentials: "include",
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  const isJson =
    contentType.includes("application/json") || contentType.includes("application/problem+json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const problem: ApiProblem =
      isJson && typeof payload === "object" && payload !== null
        ? { status: response.status, ...(payload as Record<string, unknown>) }
        : { status: response.status, detail: typeof payload === "string" ? payload : undefined };
    throw new ApiError(problem);
  }

  return payload as T;
}

/** Convenience wrappers. Use these in `src/lib/api/<domain>.ts` modules. */
export const api = {
  get: <T = unknown>(path: string, options?: Omit<ApiFetchOptions, "method" | "json">) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T = unknown>(
    path: string,
    json?: unknown,
    options?: Omit<ApiFetchOptions, "method" | "json">,
  ) => apiFetch<T>(path, { ...options, method: "POST", json }),
  patch: <T = unknown>(
    path: string,
    json?: unknown,
    options?: Omit<ApiFetchOptions, "method" | "json">,
  ) => apiFetch<T>(path, { ...options, method: "PATCH", json }),
  delete: <T = unknown>(path: string, options?: Omit<ApiFetchOptions, "method" | "json">) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
