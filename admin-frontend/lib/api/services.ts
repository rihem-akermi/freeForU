import api from "./interceptor";
import { Service } from "../data";

export interface CreateServicePayload {
  nom: string;
  description?: string;
  typePrix: "fixe" | "a_partir_de";
  prix: number;
  dureeEstimee?: number;
}

export const getServicesByAgent = async (agentId: number) => {
  const res = await api.get<Service[]>(`/services/agent/${agentId}`);
  return res.data;
};

export const getMyServices = async () => {
  const res = await api.get<Service[]>("/services/me");
  return res.data;
};

export const createService = async (payload: CreateServicePayload) => {
  const res = await api.post<Service>("/services", payload);
  return res.data;
};

export const updateService = async (
  id: number,
  payload: Partial<CreateServicePayload>
) => {
  const res = await api.patch<Service>(`/services/${id}`, payload);
  return res.data;
};

export const deleteService = async (id: number) => {
  const res = await api.delete(`/services/${id}`);
  return res.data;
};