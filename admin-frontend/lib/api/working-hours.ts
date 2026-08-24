import api from "./interceptor";

export type DayHours = {
  day_of_week: number;
  is_working: boolean;
  start_time: string | null;
  end_time: string | null;
};

export type UpdateDayHours = {
  dayOfWeek: number;
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
};

export async function getAgentWorkingHours(agentId: number): Promise<DayHours[]> {
  const res = await api.get<DayHours[]>(`/working-hours/agent/${agentId}`);
  return res.data;
}

export async function getMyWorkingHours(): Promise<DayHours[]> {
  const res = await api.get<DayHours[]>("/working-hours/me");
  return res.data;
}

export async function updateMyWorkingHours(days: UpdateDayHours[]): Promise<DayHours[]> {
  const res = await api.put<DayHours[]>("/working-hours/me", { days });
  return res.data;
}