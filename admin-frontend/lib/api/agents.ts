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

  age?: number;

  sexe?: string;

  experience_years?: number;

  social_links?: object;

  id_card_url?: string;

  work_certificate_url?: string;
};

export type AgentSearchResult = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  ville: string | null;
};

export type PublicAgentCard = {
  id: number;
  name: string;
  ville: string | null;
  photo_url: string | null;
  bio: string | null;
  category_id: number | null;
  categories: { name: string } | null;
  rating_average: number;
  rating_count: number;
};

export async function getPublicAgents(
  categoryId?: number,
): Promise<PublicAgentCard[]> {
  const query = categoryId ? `?category_id=${categoryId}` : "";
  const result = await api.get<PublicAgentCard[]>(`/agents${query}`);
  return result.data;
}

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

export async function searchAgents(name: string): Promise<AgentSearchResult[]> {
  const res = await api.get(`/agents/search?name=${name}`);

  return res.data;
}

export async function getMyProfile(): Promise<Agent> {
  const res = await api.get<Agent>("/agents/me");
  console.log("profile : ", res.data);
  return res.data;
}

export async function updateMyProfile(
  data: UpdateAgentData,
  photoFile?: File,
): Promise<Agent> {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "social_links") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  if (photoFile) {
    formData.append("photo", photoFile);
  }

  const res = await api.patch<Agent>("/agents/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export async function getAgentById(id: number): Promise<Agent> {
  const res = await api.get<Agent>(`/agents/${id}`);
  return res.data;
}
