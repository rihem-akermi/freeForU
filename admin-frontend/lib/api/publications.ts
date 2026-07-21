import api from "./interceptor";

export type Publication = {
  id: number;
  photo_url: string;
  description: string;
  status: "en_attente" | "approuvee" | "rejetee";
  created_at: string;
};
//still pubs for the admin 
//still///////***---**//++ */


// GET /agent/publications → toutes les pubs de l'agent connecté (via req.user.id, pattern /me)
export async function getMyPublications(): Promise<Publication[]> { 
    const result = await api.get<Publication[]>("/publications/me")
    return result.data
 }

// POST /agent/publications → crée une pub avec photo (multipart/form-data)
export async function createPublication(data: {
  description: string;
  photo?: File;
}): Promise<Publication> { 
    const result = await api.post<Publication>("publications/me") 
    return result.data
    //still don't know what extra do i have to do 
 }