import axios from "axios";
import { User, Agent, Reservation } from "./data";

export type { User, Agent, Reservation };

const backendUrl = 'http://localhost:3001'

/* USER */
export async function getUsers(): Promise<User[]> {
  const response = await axios.get<User[]>(backendUrl + "/users");
  const Users = response.data
  console.log(Users)
  return Users
}

export async function addUser(user: Omit<User, "id" | "created_at">): Promise<User> {
  const response = await axios.post<User>(backendUrl + "/users" ,
    user
  )
  
  const newUser = response.data
  return newUser; }

export async function updateUser(id: number, data: Partial<User>): Promise<User> {
  const response = await axios.patch<User>(backendUrl + "/users/" + id, 
    data
  ) 
  const updatedUser = response.data
  return updatedUser 
}

export async function deleteUser(id: number): Promise<User> {
  const res = await axios.delete<User>(`${backendUrl}/users/${id}`);
  const deletedUser = res.data
  return deletedUser

  // we can call it like this 
  //await deleteAgent("1");
  // or 
  //const a: Agent = await deleteAgent("1");
  //but in general delete returns void is better 
  // or
  //  you can retun a message {"messgae" : "deleted"}
}

/* Agent*/

export async function getAgents(): Promise<Agent[]> {
  const res = await axios.get<Agent[]>(backendUrl + "/agents")
  const Agents = res.data
  return Agents
}

export async function addAgent(agent : Omit<Agent, "id" | "role">) :Promise<Agent> {
  /*  Omit<Agent, "id" | "role">
  Take the Agent type, but remove the fields id and role.
  */
  const res = await axios.post<Agent>(backendUrl+"/agents",agent)

  const newAgent = res.data
  return newAgent
}


export async function updateAgent(id: number, data: Partial<Agent>): Promise<Agent> {
  const res = await axios.patch<Agent>(`${backendUrl}/agents/${id}`,data)
  const updatedAgent = res.data
  return updatedAgent
}

export async function deleteAgent(id: number): Promise<Agent> {

  const res = await axios.delete<Agent>(`${backendUrl}/agents/${id}`)
  const deletedAgent = res.data
  return deletedAgent
}

/*Reservation*/

export async function getReservations(): Promise<Reservation[]> {
  const res = await axios.get<Reservation[]>(`${backendUrl}/reservations`)
  const reservations = res.data
  return reservations 
}

export async function addReservation(reservation: { clientCin: string; agentCin: string; dateReservation: string }): Promise<Reservation> {
  const response = await axios.post<Reservation>(backendUrl + "/reservations",reservation);
  const newReservation = response.data;
  return newReservation;
}


export async function updateReservation(id: string, data: Partial<Reservation>): Promise<Reservation> {
  const response = await axios.patch<Reservation>(`${backendUrl}/reservations/${id}`, data);
  const updated = response.data
  return updated;
}

export async function deleteReservation(id: string): Promise<Reservation> {
  const res = await axios.delete<Reservation>(`${backendUrl}/reservations/${id}`,);
  const deletedReservation = res.data
  return deletedReservation
}