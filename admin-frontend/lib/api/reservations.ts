import { Reservation } from "../data";
import api from "./interceptor";
export type { Reservation };

export type CreateMyReservationData = {
  agentId: number;
  dateReservation: string;
  heureReservation: string;
  customRequest: string;
};

export type AgentDayReservation = {
  id: number;
  date_reservation: string;
  heure_reservation: string | null;
  status: string;
  custom_request: string | null;
  users: { id: number; name: string; phone: string | null; email: string };
  agent_confirmed : boolean
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



export async function getAgentDayReservations(
  date: string,
): Promise<AgentDayReservation[]> {
  const res = await api.get<AgentDayReservation[]>(
    `/reservations/agent/me/day?date=${date}`,
  );
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

export async function addReservation(reservation: {
  clientId: number;
  agentId: number;
  dateReservation: string;
  heureReservation: string;
  customRequest: string;
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

export async function deleteReservation(id: number): Promise<Reservation> {
  const res = await api.delete<Reservation>(`/reservations/${id}`);
  const deletedReservation = res.data;
  return deletedReservation;
}

export async function getMyReservationsAsAgent(): Promise<Reservation[]> {
  const res = await api.get<Reservation[]>("/reservations/agent/me");
  return res.data;
}

export async function updateAgentReservationStatus(
  id: number,
  status: "confirmee" | "annulee"
): Promise<Reservation> {
  const res = await api.patch<Reservation>(`/reservations/${id}/agent-status`, { status });
  return res.data;
}