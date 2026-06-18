import axios from "axios";

// In the BROWSER, call our own origin (/api/v1) so the rewrite in next.config.ts proxies
// to the backend — that keeps the auth cookie first-party (works in Chrome/Brave).
// On the SERVER (server components / SSR) a relative URL has no origin, so use the
// absolute backend URL directly for those requests.
const SERVER_BASE_URL = process.env.NEXT_PUBLIC_CLIENT_BASE_URL || "https://tg.ogolivagency.com";

const api = axios.create({
  baseURL: typeof window === "undefined" ? `${SERVER_BASE_URL}/api/v1` : "/api/v1",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest?.url?.includes("/users/refresh-token")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.post("/users/refresh-token");
        return api(originalRequest);
      } catch {
        if (typeof window !== "undefined") {
          localStorage.removeItem("tg_user");
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
