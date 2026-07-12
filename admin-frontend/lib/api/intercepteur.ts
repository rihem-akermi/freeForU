import axios from "axios";
import { User, Agent, Reservation } from "../data";

export type { User, Agent, Reservation };

const backendUrl = 'http://localhost:3001';

const api = axios.create({
  baseURL: backendUrl,
});
// on crée une instance axios 

//s'exécute AVANT chaque requête envoyée par `api`
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // si il y un token generé
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token ajouté à la requête :", config.url);
    }
  }
  return config;
})

export default api;