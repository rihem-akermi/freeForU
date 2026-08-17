import api from "./interceptor";

export type DayStatus = "ouvert" | "ferme" | "sans_info";
export type ClientDayStatus = "neutre" | "gris" | "jaune" | "violet" | "bleu";

export type CalendarDay = { date: string; status: DayStatus };
export type ClientCalendarDay = { date: string; status: ClientDayStatus };

export type DayAvailability = {
  date: string;
  status: DayStatus;
  start_time: string | null;
  end_time: string | null;
};

export type AgentDayStatus = "neutre" | "rouge" | "jaune" | "violet" | "bleu";
export type AgentCalendarDay = { date: string; status: AgentDayStatus };

export async function getMonthCalendar(
  agentId: number,
  year: number,
  month: number,
): Promise<CalendarDay[]> {
  const result = await api.get<CalendarDay[]>(
    `/availability/agent/${agentId}?year=${year}&month=${month}`,
  );
  return result.data;
}

// nouveau, pour le calendrier client personnalisé
export async function getClientMonthCalendar(
  agentId: number,
  year: number,
  month: number,
): Promise<ClientCalendarDay[]> {
  const result = await api.get<ClientCalendarDay[]>(
    `/availability/agent/${agentId}/client-calendar?year=${year}&month=${month}`,
  );
  return result.data;
}

export async function getAgentMonthCalendar(
  agentId: number,
  year: number,
  month: number,
): Promise<AgentCalendarDay[]> {
  const result = await api.get<AgentCalendarDay[]>(
    `/availability/agent/${agentId}/agent-calendar?year=${year}&month=${month}`,
  );
  return result.data;
}

export async function getDayAvailability(
  agentId: number,
  date: string,
): Promise<DayAvailability> {
  const result = await api.get<DayAvailability>(
    `/availability/agent/${agentId}/day?date=${date}`,
  );
  return result.data;
}
