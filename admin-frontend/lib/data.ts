export type User = {
  id: number ,
  cin: string,
  name: string,
  email: string,
  phone: string,
  password : string,
  role: "CLIENT" | "ADMIN",
  ville: string ,
  created_at: string,
};

export type Agent = {
  id: string;
  cin: string;
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
  client_id :string 
  client_cin: string;
  client_name: string;
  agent_id : string ;
  agent_cin: string;
  agent_name: string;
  date_reservation : string;
  status: "EN_ATTENTE" | "CONFIRMEE" | "ANNULEE";
  created_at : string
};
