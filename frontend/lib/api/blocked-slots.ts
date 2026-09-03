import api from "./interceptor";

export type BlockedSlot = {
  id: number;
  agent_id: number;
  date: string;
  type: "off" | "full";
  reason: string | null;
};

export type CreateBlockedSlotPayload = {
  date: string;
  reason?: string;
};

export async function createBlockedSlot(
  payload: CreateBlockedSlotPayload,
): Promise<BlockedSlot> {
  const res = await api.post<BlockedSlot>("/blocked-slots", payload);
  return res.data;
}
export async function getMyBlockedSlots(): Promise<BlockedSlot[]> {
  const res = await api.get<BlockedSlot[]>("/blocked-slots/me");
  return res.data;
}

export async function setDayException(
  date: string,
  type: "off" | "full",
): Promise<{ type: "off" | "full" | null }> {
  const res = await api.post<{ type: "off" | "full" | null }>(
    "/blocked-slots/set-exception",
    { date, type },
  );
  return res.data;
}

export async function deleteBlockedSlot(id: number): Promise<void> {
  await api.delete(`/blocked-slots/${id}`);
}
