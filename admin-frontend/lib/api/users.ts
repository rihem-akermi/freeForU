import { User } from "../data"
import api from "./intercepteur";
export type {User}


/* USER */
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
