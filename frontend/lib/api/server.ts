import "server-only";
import axios from "axios";
import { cookies } from "next/headers";
import type { Agent } from "../data";

async function serverApi() {
  const cookieStore = await cookies();
  return axios.create({
    baseURL: process.env.BACKEND_URL,
    headers: { cookie: cookieStore.toString() },
  });
}

export async function getAgentsForPage(): Promise<Agent[]> {
  const api = await serverApi();
  const response = await api.get<Agent[]>("/agents/all");
  return response.data;
}
