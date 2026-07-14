
import { Agent } from "../data"
import api from "./interceptor"
export type {Agent}


export type AgentSearchResult = {
  id: string;
  name: string;
  phone: string;
  email: string;
  ville: string;
};


export async function getAgents(): Promise<Agent[]> {
  const res = await api.get<Agent[]>("/agents")
  const Agents = res.data
  return Agents
}

export async function addAgent(agent : Omit<Agent, "id" | "role">) :Promise<Agent> {
  /*  Omit<Agent, "id" | "role">
  Take the Agent type, but remove the fields id and role.
  */
  const res = await api.post<Agent>("/agents",agent)

  const newAgent = res.data
  return newAgent
}


export async function updateAgent(id: number, data: Partial<Agent>): Promise<Agent> {
  const res = await api.patch<Agent>(`/agents/${id}`,data)
  const updatedAgent = res.data
  return updatedAgent
}

export async function deleteAgent(id: number): Promise<Agent> {

  const res = await api.delete<Agent>(`/agents/${id}`)
  const deletedAgent = res.data
  return deletedAgent
}

export async function searchAgents(name: string): Promise<AgentSearchResult[]> {

  if (!name.trim()) {
    return [];
  }

  const response = await api.get<AgentSearchResult[]>(
    `/agents/search?name=${name}`
  );

  return response.data;
}
