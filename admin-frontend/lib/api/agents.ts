import api from "./interceptor";
import { Agent } from "../data";

export type { Agent };

export type CreateAgentData = {
  name: string;

  email: string;

  phone: string;

  ville: string;

  password: string;

  category_id: number;
};

export type UpdateAgentData = Partial<CreateAgentData> & {
  photo_url?: string;

  bio?: string;

  zone?: string;

  service_mode?: string;

  tarif_min?: number;

  tarif_max?: number;

  age?: number;

  sexe?: string;

  experience_years?: number;

  social_links?: object;

  id_card_url?: string;

  work_certificate_url?: string;
};

export async function getAgents(): Promise<Agent[]> {
  const res = await api.get<Agent[]>("/agents");

  return res.data;
}

export async function addAgent(agent: CreateAgentData): Promise<Agent> {
  const res = await api.post<Agent>("/agents", agent);

  return res.data;
}

export async function updateAgent(
  id: number,
  data: UpdateAgentData,
): Promise<Agent> {
  const res = await api.patch<Agent>(`/agents/${id}`, data);

  return res.data;
}

export async function deleteAgent(id: number): Promise<Agent> {
  const res = await api.delete<Agent>(`/agents/${id}`);

  return res.data;
}

export async function searchAgents(name: string) {
  if (!name.trim()) return [];
  const res = await api.get(`/agents/search?name=${name}`);
  return res.data;
}

export async function getMyProfile(): Promise<Agent> {
  const res = await api.get<Agent>("/agents/me");
  console.log("profile : ", res.data);
  return res.data;
}

export async function updateMyProfile(data: UpdateAgentData): Promise<Agent> {
  // le backend sait déjà qui fait la requête grâce au token dans les cookies
  const res = await api.patch<Agent>("/agents/me", data);

  return res.data;
}
