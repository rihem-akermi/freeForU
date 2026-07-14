import api from "./interceptor";

type SignupData = {
  name: string;
  email: string;
  password: string;
  ville: string;
  phone: string;
  role: "CLIENT" | "AGENT";
  category?: string; //optinnel
};

export async function signup(data: SignupData) {
  const response = await api.post("/auth/signup", data);
  return response.data;
}