import api from "./intercepteur";

export async function login(email: string, password: string) {

    const response = await api.post("/auth/login", 
    { email,
      password 
    })
  const validUser =  response.data //  { user : without password, accessToken, refreshToken }
  return validUser
  
}