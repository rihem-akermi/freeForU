import api from "./interceptor";

export type WorkingHour = {
  id: number;
  agent_id: number;
  week_start: string;
  day_of_week: number;
  is_working: boolean;
  start_time: string | null;
  end_time: string | null;
};

export type WorkingHourPayload = {
  week_start: string; // "YYYY-MM-DD"
  day_of_week: number;
  is_working: boolean;
  start_time?: string;
  end_time?: string;
};

// GET /working-hours/me?week_start=2026-08-02
export async function getMyWorkingHours(weekStart: string): Promise<WorkingHour[]> {
  const res = await api.get<WorkingHour[]>(`/working-hours/me?week_start=${weekStart}`);
  return res.data;
}

export async function setWorkingHour(payload: WorkingHourPayload): Promise<WorkingHour> {
  const res = await api.put<WorkingHour>("/working-hours/me", payload);
  return res.data;
}

export async function removeWorkingDay(weekStart: string, dayOfWeek: number): Promise<void> {
  await api.delete(`/working-hours/me/${dayOfWeek}?week_start=${weekStart}`);
}

// FIX 1 — "HH:MM:SS" ou "1970-01-01T14:00:00.000Z" → "HH:MM"
export function toTimeInput(prismaTime: string | null): string {
  if (!prismaTime) return "";
  if (/^\d{2}:\d{2}/.test(prismaTime)) return prismaTime.slice(0, 5);
  const match = prismaTime.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : "";
}
