import api from "./interceptor";
import { Offer } from "../data";

export type CreateOfferData = {
  title: string;
  description: string;
  min_price?: number;
  max_price?: number;
  photo?: File;
};

export type UpdateOfferData = Partial<Omit<CreateOfferData, "photo">> & {
  active?: boolean;
  photo?: File; // exclude the original photo first and then redefine it.
};

export async function getMyOffers(): Promise<Offer[]> {
  const result = await api.get<Offer[]>("/offers/me");
  return result.data;
}

export async function createOffer(data: CreateOfferData): Promise<Offer> {
  console.log("the offer : ", data);
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  if (data.min_price !== undefined)
    formData.append("min_price", String(data.min_price));
  if (data.max_price !== undefined)
    formData.append("max_price", String(data.max_price));
  if (data.photo) formData.append("photo", data.photo);

  const result = await api.post<Offer>("/offers", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return result.data;
}

export async function updateOffer(
  id: number,
  data: UpdateOfferData,
): Promise<Offer> {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || key === "photo") return;
    if (key === "active") {
        console.log(key ," : ", value)
      formData.append(key, value ? "true" : "false");
    } else {
      formData.append(key, String(value));
    }
  });
  if (data.photo) formData.append("photo", data.photo);

  const result = await api.patch<Offer>(`/offers/${id}`, formData);
  return result.data;
}

export async function deleteOffer(id: number): Promise<Offer> {
  const result = await api.delete<Offer>(`/offers/${id}`);
  return result.data;
}
