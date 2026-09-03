import axios from "axios";
import { User, Agent, Reservation } from "../data";

export type { User, Agent, Reservation };

const backendUrl = "http://localhost:3001";

// on crée une instance axios
const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  // dit à axios d'envoyer automatiquement les cookies avec chaque requête
});

// le token est dans le cookie
// Plus besoin d'intercepteur de REQUÊTE pour ajouter le token à la main !
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("⏰ Access token expiré, tentative de refresh...");

      try {
        await axios.post(
          `${backendUrl}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        console.log("✅ Nouveau access token obtenu, on rejoue la requête");

        // Forcer la recréation propre de la requête
        return api({
          method: originalRequest.method,
          url: originalRequest.url,
          data: originalRequest.data,
          params: originalRequest.params,
          withCredentials: true,
        });
      } catch (refreshError) {
        console.log("❌ Refresh échoué, redirection login");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
