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


export interface Agent {
  id: number;
  name: string;
  category: string;
  ville : string ;
  email: string;
  phone: string;
  role: "AGENT";
}


export type CreateAgentData = {
  name: string;
  email: string;
  phone: string;
  ville: string;
  password: string;
  category_id: number;
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

export type Contact = {
  idcontact : number , 
  name : string , 
  email : string , 
  message : string 
  created_at : string 
}