export type User = {
  id: number,
  name: string,
  email: string,
  password : string,
  role: "CLIENT" | "AGENT" | "ADMIN",
  ville: string ,
  created_at: string,
};

export type Agent = {
  id: string;
  name: string;
  category: string;
  phone: string;
  password : string;
  ville: string;
  role : "AGENT",
  published: boolean;
};

export type Reservation = {
  id: string;
  clientName: string;
  agentName: string;
  date: string;
  status: "EN_ATTENTE" | "CONFIRMEE" | "ANNULEE";
};



export const Reservations: Reservation[] = [
  { id: "r1", clientName: "Sarra Ben Ali", agentName: "Karim Plombier", date: "2026-07-10", status: "CONFIRMEE" },
  { id: "r2", clientName: "Sarra Ben Ali", agentName: "Yassine Technicien", date: "2026-07-15", status: "EN_ATTENTE" },
];
