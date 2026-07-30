import api from "./interceptor";
import {Publication} from "../data"

//still pubs for the admin
//still///////***---**//++ */

export async function getMyPublications(): Promise<Publication[]> {
  const result = await api.get<Publication[]>("/publications/me");
  return result.data;
}

export async function createPublication(data: {
  titre: string;
  description: string;
  photo?: File;
}): Promise<Publication> {
  const formData = new FormData();
  formData.append("titre", data.titre);
  formData.append("description", data.description);
  if (data.photo) {
    formData.append("photo", data.photo);
  }

  const result = await api.post<Publication>("/publications", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return result.data;
}
