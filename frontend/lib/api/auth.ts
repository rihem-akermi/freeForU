import api from "./interceptor";

type SignupData = {
  name: string;
  email: string;
  password: string;
  ville: string;
  phone: string;
  role: "CLIENT" | "AGENT";
  category_id?: number;
};

export async function signup(data: SignupData) {
  const response = await api.post("/auth/signup", data);
  return response.data;
}

export async function login(email: string, password: string) {
  const response = await api.post("/auth/login", { email, password });
  const validUser = response.data;
  return validUser;
}

export async function logout() {
  console.log("👋 Déconnexion...");
  await api.post("/auth/logout", {}, { withCredentials: true });
  window.location.href = "/login";
}

export async function getMe() {
  const response = await api.get("/auth/me");
  return response.data;
}

export async function verifyEmail(email: string, code: string) {
  const response = await api.post("/auth/verify-email", { email, code });
  return response.data;
}

export async function resendOtp(
  email: string,
  purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
) {
  const response = await api.post("/auth/resend-otp", { email, purpose });
  return response.data;
}

export async function forgotPassword(email: string) {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
) {
  const response = await api.post("/auth/reset-password", {
    email,
    code,
    newPassword,
  });
  return response.data;
}
