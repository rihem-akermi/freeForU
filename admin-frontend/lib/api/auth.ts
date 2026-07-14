import api from "./interceptor";

export async function login(email: string, password: string) {

    const response = await api.post("/auth/login", 
    { email,
      password 
    })
  const validUser =  response.data
  return validUser
}

export async function logout() {
  console.log("👋 Déconnexion...");
  await api.post("/auth/logout", {}, { withCredentials: true });
  window.location.href = "/login";
}