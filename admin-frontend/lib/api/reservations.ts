import { Reservation } from "../data";
import api from "./interceptor";
export type {Reservation}

/*Reservation*/

export async function getReservations(): Promise<Reservation[]> {
  const res = await api.get<Reservation[]>(`/reservations`)
  const reservations = res.data
  return reservations 
}

export async function addReservation(reservation: { clientCin: string; agentCin: string; dateReservation: string }): Promise<Reservation> {
  const response = await api.post<Reservation>("/reservations",reservation);
  const newReservation = response.data;
  return newReservation;
}


export async function updateReservation(id: string, data: Partial<Reservation>): Promise<Reservation> {
  const response = await api.patch<Reservation>(`/reservations/${id}`, data);
  const updated = response.data
  return updated;
}

export async function deleteReservation(id: string): Promise<Reservation> {
  const res = await api.delete<Reservation>(`/reservations/${id}`,);
  const deletedReservation = res.data
  return deletedReservation
}