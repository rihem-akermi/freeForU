import api from "./interceptor";

export type ClientCalendarDay = { date: string; status: ClientDayStatus };
export type AgentCalendarDay = { date: string; status: AgentDayStatus };

export type DayStatus = "ouvert" | "ferme" | "sans_info";
export type ClientDayStatus = "neutre" | "gris" | "jaune" | "violet" | "bleu";
export type AgentDayStatus = "neutre" | "rouge" | "jaune" | "violet" | "bleu";

export type DayAvailability = {
  date: string;
  status: DayStatus;
  start_time: string | null;
  end_time: string | null;
};



//calendar client  
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

//calendar agent 
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
