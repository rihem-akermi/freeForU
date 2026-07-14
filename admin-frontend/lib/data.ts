export type User = {
  id: number ,
  name: string,
  email: string,
  phone: string,
  password : string,
  role: "CLIENT" | "ADMIN",
  ville: string ,
  created_at: string,
};

export type Agent = {
  id: number;
  name: string;
  category: string;
  email: string;
  phone: string;
  password : string;
  ville: string;
  role : "AGENT",
  published: boolean;
};


export type Reservation = {
  id: string;

  client_id: string;
  agent_id: string;

  client_name: string;
  client_phone: string;
  client_email: string;
  client_ville: string;

  agent_name: string;
  agent_phone: string;
  agent_email: string;
  agent_ville: string;

  date_reservation: string;
  status: "EN_ATTENTE" | "CONFIRMEE" | "ANNULEE";
  created_at: string;
};
