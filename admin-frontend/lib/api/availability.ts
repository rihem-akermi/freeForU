import api from "./interceptor";

export type DayStatus = "rouge" | "orange" | "vert" | "sans_info";

export type CalendarDay = {
  date: string;
  status: DayStatus;
};

export type DayAvailability = {
  date: string;
  status: DayStatus;
  available_hours: string[];
};

export async function getMonthCalendar(agentId: number, year: number, month: number): Promise<CalendarDay[]> {
  const result = await api.get<CalendarDay[]>(`/availability/agent/${agentId}?year=${year}&month=${month}`);
  return result.data;
}

export async function getDayAvailability(agentId: number, date: string): Promise<DayAvailability> {
  const result = await api.get<DayAvailability>(`/availability/agent/${agentId}/day?date=${date}`);
  return result.data;
}