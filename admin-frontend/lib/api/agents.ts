
import { Agent } from "../data"
import api from "./interceptor"
export type {Agent}

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
