import api from "./interceptor";
import { Review } from "../data";

export type RatingSummary = {
  average: number;
  count: number;
};

export type CreateReviewPayload = {
  reservation_id: number;
  rating: number;
  comment?: string;
};

export async function createReview(payload: CreateReviewPayload): Promise<Review> {
  const result = await api.post<Review>("/reviews", payload);
  return result.data;
}

export async function getAgentReviews(agentId: number): Promise<Review[]> {
  const result = await api.get<Review[]>(`/reviews/agent/${agentId}`);
  return result.data;
}

export async function getAgentRatingSummary(agentId: number): Promise<RatingSummary> {
  const result = await api.get<RatingSummary>(`/reviews/agent/${agentId}/summary`);
  return result.data;
}

export async function getAllReviews(): Promise<Review[]> {
  const result = await api.get<Review[]>("/reviews");
  return result.data;
}

export async function deleteReview(id: number): Promise<Review> {
  const result = await api.delete<Review>(`/reviews/${id}`);
  return result.data;
}