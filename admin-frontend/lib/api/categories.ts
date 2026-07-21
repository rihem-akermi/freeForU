import api from "./interceptor";
import { Category } from "../data";

type newCategory = {
  name : string 
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>("/categories");

  return response.data;
}

export async function addCategory({name}:newCategory) {
  const response = await api.post<Category>("/categories", { name });

  return response.data;
}

export async function updateCategory(id: number,{name} : newCategory ) {
  const response = await api.patch<Category>(`/categories/${id}`, { name });

  return response.data;
}

export async function deleteCategory(id: number) {
  return await api.delete(`categories/${id}`);
}
