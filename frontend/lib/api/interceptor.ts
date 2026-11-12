import axios from "axios";
import { User, Agent, Reservation } from "../data";

export type { User, Agent, Reservation };

const    api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // no config = not a normal HTTP error, nothing to retry
    if (!originalRequest) return Promise.reject(error);

    if (originalRequest.url?.includes("/auth/me")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // same-origin, goes through the rewrite
        await api.post("/auth/refresh");
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