import axios from "axios";
import { User, Agent, Reservation } from "../data";

export type { User, Agent, Reservation };

const backendUrl = 'http://localhost:3001';

// on crée une instance axios
const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // dit à axios d'envoyer automatiquement les cookies avec chaque requête

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
        await axios.post(`${backendUrl}/auth/refresh`, {}, { withCredentials: true });
        console.log("✅ Nouveau access token obtenu (cookie mis à jour), on rejoue la requête");
        return api(originalRequest); // 👈 le nouveau cookie est déjà posé par le backend, pas besoin de le remanipuler ici
      } catch (refreshError) {
        console.log("❌ Refresh échoué, redirection login");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;