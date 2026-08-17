import { Reservation } from "../data";
import api from "./interceptor";
export type { Reservation };

export type CreateMyReservationData = {
  agentId: number;
  serviceId?: number;
  customRequest?: string;
  dateReservation: string;
  heureReservation: string;
  heureFinReservation?: string;
};
export type AgentDayReservation = {
  id: number;
  date_reservation: string;
  heure_reservation: string | null;
  heure_fin_reservation: string | null; // ← ajouté
  status: string;
  custom_request: string | null;
  service_nom: string | null; // ← ajouté
  service_prix: number | null; // ← ajouté
  users: { id: number; name: string; phone: string | null; email: string };
  agent_confirmed: boolean;
};

export async function getReservations(): Promise<Reservation[]> {
  const res = await api.get<Reservation[]>(`/reservations`);
  const reservations = res.data;
  return reservations;
}

export async function createMyReservation(
  data: CreateMyReservationData,
): Promise<Reservation> {
  const res = await api.post<Reservation>("/reservations/me", data);
  return res.data;
}

export async function getMyReservations(): Promise<Reservation[]> {
  const res = await api.get<Reservation[]>("/reservations/me");
  return res.data;
}

export async function getMyPendingReservations(): Promise<Reservation[]> {
  const res = await api.get<Reservation[]>("/reservations/status/me");
  return res.data;
}

export async function getAgentDayReservations(
  date: string,
): Promise<AgentDayReservation[]> {
  const res = await api.get<AgentDayReservation[]>(
    `/reservations/agent/me/day?date=${date}`,
  );
  return res.data;
}

export async function getMyReservationsAsAgent(): Promise<Reservation[]> {
  const res = await api.get<Reservation[]>("/reservations/agent/me");
  return res.data;
}

export async function confirmMyReservationCompletion(
  id: number,
): Promise<Reservation> {
  const res = await api.patch<Reservation>(
    `/reservations/${id}/confirm-completion`,
  );
  return res.data;
}

export async function cancelMyReservation(id: number): Promise<Reservation> {
  const res = await api.patch<Reservation>(`/reservations/${id}/cancel`);
  return res.data;
}

export async function addReservation(reservation: {
  clientId: number;
  agentId: number;
  serviceId?: number;
  customRequest?: string;
  dateReservation: string;
  heureReservation: string;
  heureFinReservation?: string;
}): Promise<Reservation> {
  const response = await api.post<Reservation>("/reservations", reservation);
  return response.data;
}
export async function updateReservation(
  id: number,
  data: Partial<Pick<Reservation, "status" | "date_reservation">>,
): Promise<Reservation> {
  const res = await api.patch<Reservation>(`/reservations/${id}`, data);
  return res.data;
}
export async function updateAgentReservationStatus(
  id: number,
  status: "confirmee" | "rejetee",
): Promise<Reservation> {
  const res = await api.patch<Reservation>(`/reservations/${id}/agent-status`, {
    status,
  });
  return res.data;
}
export async function deleteReservation(id: number): Promise<Reservation> {
  const res = await api.delete<Reservation>(`/reservations/${id}`);
  const deletedReservation = res.data;
  return deletedReservation;
}
