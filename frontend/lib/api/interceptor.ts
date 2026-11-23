import axios from "axios";
import { User, Agent, Reservation } from "../data";

export type { User, Agent, Reservation };

const    api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // no config = not a normal HTTP error, nothing to retry
    if (!originalRequest) return Promise.reject(error);

    // Auth endpoints (especially refresh itself) must never recursively retry.
    if (originalRequest.url?.includes("/auth/")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Share a single rotation request when several API calls fail together.
        if (!refreshPromise) {
          refreshPromise = api
            .post("/auth/refresh")
            .then(() => undefined)
            .finally(() => {
              refreshPromise = null;
            });
        }
        await refreshPromise;
        return api(originalRequest);
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
