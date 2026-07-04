import { Users, Agents, Reservations, User, Agent, Reservation } from "./data";

export type { User, Agent, Reservation };

/* USER */
export async function getUsers(): Promise<User[]> {
  //normalement m database
  //normalement requete vers la base
  //fetch("url du nestjs")
  return Users; 
}
export async function addUser(user : User) {
  // i don't know what i am supposed to do exactly hereand if the params are true
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  //url + method + body  
  console.log("mise à jour du user", id, data);
}

export async function deleteUser(id: string): Promise<void> {
  //fetc("url",{
  //method : "DELETE"})
  console.log("suppression du user", id);
}

/* Agent*/

export async function getAgents(): Promise<Agent[]> {
  return Agents;
}

export async function addAgent(agent : Agent) {
  // i don't know what i am supposed to do exactly hereand if the params are true
}

export async function deleteAgent(id: string): Promise<void> {
  console.log("suppression de l'agent", id);
}

export async function updateAgent(id: string, data: Partial<Agent>): Promise<void> {
  //url + method + body  
  console.log("mise à jour du user", id, data);
}

/*Reservation*/

export async function getReservations(): Promise<Reservation[]> {
  return Reservations;
}

export async function addReservation(reservation : Reservation) {
  // i don't know what i am supposed to do exactly hereand if the params are true
}

export async function deleteReservation(id: string): Promise<void> {
  console.log("suppression de l'Reservation", id);
}

export async function updateReservation(id: string, data: Partial<Reservation>): Promise<void> {
  //url + method + body  
  console.log("mise à jour du user", id, data);
}


/*

export type User = {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "AGENT" | "ADMIN";
  createdAt: string;
};

export type Agent = {
  id: string;
  userId: string;
  name: string;
  category: string;
  phone: string;
  address: string;
  published: boolean;
};

export type Reservation = {
  id: string;
  clientName: string;
  agentName: string;
  date: string;
  status: "EN_ATTENTE" | "CONFIRMEE" | "ANNULEE";
};

*/