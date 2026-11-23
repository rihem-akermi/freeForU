import "server-only";
import axios from "axios";
import { cookies } from "next/headers";
import type { Agent, Category, Contact, Reservation, User } from "../data";

async function serverApi() {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error("BACKEND_URL must be set for server-side API requests.");
  }

  const cookieStore = await cookies();
  return axios.create({
    baseURL: backendUrl,
    headers: { cookie: cookieStore.toString() },
  });
}

async function getServerData<T>(path: string): Promise<T> {
  const api = await serverApi();
  const response = await api.get<T>(path);
  return response.data;
}

export async function getAgentsForPage(): Promise<Agent[]> {
  return getServerData<Agent[]>("/agents/all");
}

export function getCategoriesForPage(): Promise<Category[]> {
  return getServerData<Category[]>("/categories");
}

export function getContactsForPage(): Promise<Contact[]> {
  return getServerData<Contact[]>("/contacts");
}

export function getUsersForPage(): Promise<User[]> {
  return getServerData<User[]>("/users");
}

export function getReservationsForPage(): Promise<Reservation[]> {
  return getServerData<Reservation[]>("/reservations");
}
