import api from "./interceptor";
import {Publication} from "../data"

//still pubs for the admin
//still///////***---**//++ */

export type CreatePublicationData = {
  titre: string;
  description: string;
  photo?: File;
};

export type UpdatePublicationData = {
  titre?: string;
  description?: string;
  photo?: File;
};

export async function getMyPublications(): Promise<Publication[]> {
  const result = await api.get<Publication[]>("/publications/me");
  return result.data;
}

export async function createPublication(data: CreatePublicationData): Promise<Publication> {
  const formData = new FormData();
  formData.append("titre", data.titre);
  formData.append("description", data.description);
  if (data.photo) formData.append("photo", data.photo);

  const result = await api.post<Publication>("/publications", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return result.data;
}

export async function updatePublication(id: number, data: UpdatePublicationData): Promise<Publication> {
  const formData = new FormData();
  if (data.titre !== undefined) formData.append("titre", data.titre);
  if (data.description !== undefined) formData.append("description", data.description);
  if (data.photo) formData.append("photo", data.photo);

  const result = await api.patch<Publication>(`/publications/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return result.data;
}

export async function deletePublication(id: number): Promise<Publication> {
  const result = await api.delete<Publication>(`/publications/${id}`);
  return result.data;
}

export async function getAgentPortfolio(agentId: number): Promise<Publication[]> {
  const result = await api.get<Publication[]>(`/publications/agent/${agentId}`);
  return result.data;
}

export async function getPendingPublications(): Promise<Publication[]> {
  const result = await api.get<Publication[]>("/publications/admin");
  return result.data;
}

export async function updatePublicationStatus(id: number, status: "approuvee" | "rejetee"): Promise<Publication> {
  const result = await api.patch<Publication>(`/publications/${id}/status`, { status });
  return result.data;
}