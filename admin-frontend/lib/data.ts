export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "CLIENT" | "ADMIN";
  ville: string;
  created_at: string;
  photo_url?: string;
};

export type Agent = {
  id: number;
  name: string;
  categories: {
    id: number;
    name: string;
  };
  ville: string;
  email: string;
  phone: string;
  role: "AGENT";
  photo_url?: string;
  bio?: string;
  zone?: string;
  service_mode?: string;
  age?: number;
  sexe?: string;
  experience_years?: number;
  social_links?: Record<string, string>; //? : record
  id_card_url?: string;
  work_certificate_url?: string;
  verification_status?: string; //attestation
};

export type Reservation = {
  id: number;
  client_id: number;
  agent_id: number;
  custom_request: string;
  heure_reservation: string | null;
  heure_fin_reservation: string | null;
  date_reservation: string;
  status:
    | "en_attente"
    | "confirmee"
    | "terminee"
    | "rejetee"
    | "annulee"
    | "expiree";
  agent_confirmed: boolean;
  client_confirmed: boolean;
  archived: boolean;
  service_id: number | null;
  service_nom: string | null;
  service_prix: number | null;
  created_at: string;
  users?: {
    id: number;
    name: string;
    phone: string | null;
    email: string;
    ville: string | null;
  };
  agents?: {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    ville: string | null;
    photo_url?: string | null;
  };
  reviews?: { id: number; rating: number } | null;
};

export type Contact = {
  idcontact: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export type Category = {
  id: number;
  name: string;
};

export type Publication = {
  id: number;
  titre: string;
  photo_url: string;
  description: string;
  status: "en_attente" | "approuvee" | "rejetee";
  likes_count: number;
  saved_count: number;
  created_at: string;
};

export type Review = {
  id: number;
  agent_id: number;
  reservation_id: number;
  client_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  users?: { name: string };
};

export interface Service {
  id: number;
  agent_id: number;
  nom: string;
  description?: string;
  type_prix: "fixe" | "a_partir_de";
  prix: number;
  duree_estimee?: number;
  created_at?: string;
}
