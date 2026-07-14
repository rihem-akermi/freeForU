import { User } from "../data"
import api from "./interceptor";
export type {User}


export type ClientSearchResult = {
  id: string;
  name: string;
  phone: string;
  email: string;
  ville: string;
};

export async function getUsers(): Promise<User[]> {
  const response = await api.get<User[]>("/users");
  const Users = response.data
  console.log(Users)
  return Users
}

export async function addUser(user: Omit<User, "id" | "created_at">): Promise<User> {
  const response = await api.post<User>("/users",
    user
  )
  
  const newUser = response.data
  return newUser; }

export async function updateUser(id: number, data: Partial<User>): Promise<User> {
  const response = await api.patch<User>("/users/" + id, 
    data
  ) 
  const updatedUser = response.data
  return updatedUser 
}

export async function deleteUser(id: number): Promise<User> {
  const res = await api.delete<User>(`/users/${id}`);
  const deletedUser = res.data
  return deletedUser

  // we can call it like this 
  //await deleteAgent("1");
  // or 
  //const a: Agent = await deleteAgent("1");
  //but in general delete returns void is better 
  // or
  //  you can retun a message {"messgae" : "deleted"}
}

export async function searchClients(name: string): Promise<ClientSearchResult[]> {

  if (!name.trim()) {
    return [];
  }

  const response = await api.get<ClientSearchResult[]>(
    `/users/search?name=${name}`
  );

  return response.data;
}