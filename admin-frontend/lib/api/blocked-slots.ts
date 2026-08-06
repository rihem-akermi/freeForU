import api from "./interceptor";

export type BlockedSlot = {
  id: number;
  agent_id: number;
  date: string; // "YYYY-MM-DD"
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

export type CreateBlockedSlotPayload = {
  date: string; // "YYYY-MM-DD"
  start_time?: string; // "HH:mm" — absent = journée entière bloquée
  end_time?: string; // "HH:mm"
  reason?: string;
};

// GET /blocked-slots/me
export async function getMyBlockedSlots(): Promise<BlockedSlot[]> {
  const res = await api.get<BlockedSlot[]>("/blocked-slots/me");
  return res.data;
}

// POST /blocked-slots
export async function createBlockedSlot(
  payload: CreateBlockedSlotPayload,
): Promise<BlockedSlot> {
  const res = await api.post<BlockedSlot>("/blocked-slots", payload);
  return res.data;
}

// DELETE /blocked-slots/:id
export async function deleteBlockedSlot(id: number): Promise<void> {
  await api.delete(`/blocked-slots/${id}`);
}
