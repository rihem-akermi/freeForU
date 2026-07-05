import { Agents, Reservations, User, Agent, Reservation } from "./data";

export type { User, Agent, Reservation };

/* USER */
export async function getUsers(): Promise<User[]> {
  const response = await fetch("http://localhost:3001/users");
  const Users = await response.json()
  console.log(Users)
  return Users
}
export async function addUser(user: Omit<User, "id" | "created_at">): Promise<User> {
  console.log("📤 Envoi addUser :", user);
  const response = await fetch("http://localhost:3001/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  const newUser = await response.json();
  console.log("📥 User créé reçu :", newUser);
  return newUser; // 👈 contient l'id généré par PostgreSQL, utile pour l'affichage
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  console.log("mise à jour du user", id, data);
}

export async function deleteUser(id: number): Promise<void> {
  console.log("🗑️ Suppression du user :", id);
  await fetch(`http://localhost:3001/users/${id}`, {
    method: "DELETE",
  });

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


