export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "CLIENT" | "ADMIN";
  ville: string;
  created_at: string;
};


export type Agent = {
  id: number;
  name: string;
  category: string;
  category_id?: number;
  ville: string;
  email: string;
  phone: string;
  role: "AGENT";
  photo_url?: string;
  bio?: string;
  zone?: string;
  service_mode?: string;
  tarif_min?: number;
  tarif_max?: number;
  age?: number;
  sexe?: string;
  experience_years?: number;
  social_links?: Record<string, string>;//? : record
  id_card_url?: string;
  work_certificate_url?: string;
  verification_status?: string; //attestation
}

export type Reservation = {
  id: number;

  client_id: number;
  agent_id: number;

  users: {
    id: number;
    name: string;
    phone: string | null;
    email: string;
    ville: string | null;
  };

  agents: {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    ville: string | null;
  };

  date_reservation: string;
  status: "EN_ATTENTE" | "CONFIRMEE" | "ANNULEE";
  created_at: string;
};

export type Contact = {
  idcontact: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export type Category = {
  id : number ; 
  name : string 
}
