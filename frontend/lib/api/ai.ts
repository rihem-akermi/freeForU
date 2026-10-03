import api from "./interceptor";

export interface GeneratedService {
  nom: string;
  description: string;
}

export interface GeneratedPublication {
  titre: string;
  description: string;
}


export async function generateAgentBio(rawBio: string): Promise<string> {
  const res = await api.post<{ bio: string }>("/ai/generate-bio", { rawBio });
  return res.data.bio;
}

export async function generateService(
  rawInput: string,
): Promise<GeneratedService> {
  const res = await api.post<GeneratedService>("/ai/generate-service-infos", {
    rawInput,
  });
  return res.data;
}


export async function generatePublication  (
  rawInput: string,
): Promise<GeneratedPublication>{
  const res = await api.post<GeneratedPublication>(
    "/ai/generate-publication-infos",
    { rawInput },
  );
  return res.data;
};