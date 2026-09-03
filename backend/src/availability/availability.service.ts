import { Injectable } from "@nestjs/common";
import { WorkingHoursRepository } from "src/working-hours/working-hours.repository";
import { BlockedSlotsRepository } from "src/blocked-slots/blocked-slots.repository";
import { reservationsRepository } from "src/reservations/reservations.repository";
import { formatDbTime } from "src/common/utils/date.utils";

type DayStatus = "ouvert" | "ferme" | "sans_info";
type ClientDayStatus = "neutre" | "gris" | "jaune" | "violet" | "bleu";
type AgentDayStatus = "neutre" | "rouge" | "jaune" | "violet" | "bleu";

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}



@Injectable()
export class AvailabilityService {
  constructor(
    private workingHoursRepository: WorkingHoursRepository,
    private blockedSlotsRepository: BlockedSlotsRepository,
    private reservationsRepository: reservationsRepository
  ) {}

  // Phase D — statut ouvert/fermé brut d'un agent (pas encore utilisé directement par le frontend, mais gardé)
  async getMonthCalendar(agentId: number, year: number, month: number) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0);

    const [allWorkingHours, blockedDays] = await Promise.all([
      this.workingHoursRepository.findByAgentId(agentId),
      this.blockedSlotsRepository.findByAgentAndDateRange(agentId, from, to),
    ]);

    const blockedDateKeys = new Set(blockedDays.map((b) => toDateKey(b.date)));
    const result: { date: string; status: DayStatus }[] = [];

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const dateKey = toDateKey(d);
      const dayOfWeek = d.getDay();
      const workingHour = allWorkingHours.find((wh) => wh.day_of_week === dayOfWeek);

      if (!workingHour) {
        result.push({ date: dateKey, status: "sans_info" });
      } else if (!workingHour.is_working || blockedDateKeys.has(dateKey)) {
        result.push({ date: dateKey, status: "ferme" });
      } else {
        result.push({ date: dateKey, status: "ouvert" });
      }
    }
    return result;
  }

  // Phase D — détail d'un jour (horaires) pour DayAvailabilityModal
  async getDayAvailability(agentId: number, dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dayOfWeek = date.getDay();

    const [allWorkingHours, blockedDay] = await Promise.all([
      this.workingHoursRepository.findByAgentId(agentId),
      this.blockedSlotsRepository.findByAgentAndDate(agentId, date),
    ]);

    const workingHour = allWorkingHours.find((wh) => wh.day_of_week === dayOfWeek);

    if (!workingHour) {
      return { date: dateStr, status: "sans_info" as DayStatus, start_time: null, end_time: null };
    }
    if (!workingHour.is_working || blockedDay) {
      return { date: dateStr, status: "ferme" as DayStatus, start_time: null, end_time: null };
    }
    return {
      date: dateStr,
      status: "ouvert" as DayStatus,
      start_time: formatDbTime(workingHour.start_time),
      end_time: formatDbTime(workingHour.end_time),
    };
  }

  // Phase E — calendrier CLIENT (personnel)
  async getClientMonthCalendar(agentId: number, clientId: number, year: number, month: number) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0);

    const [allWorkingHours, blockedDays, myReservations] = await Promise.all([
      this.workingHoursRepository.findByAgentId(agentId),
      this.blockedSlotsRepository.findByAgentAndDateRange(agentId, from, to),
      this.reservationsRepository.findByClientAndAgentInRange(clientId, agentId, from, to),
    ]);

    const blockedDateKeys = new Set(blockedDays.map((b) => toDateKey(b.date)));
    const statusPriority: Record<string, number> = { en_attente: 3, confirmee: 2, terminee: 1 };
    const myStatusByDate = new Map<string, string>();
    for (const r of myReservations) {
      const key = toDateKey(r.date_reservation);
      const current = myStatusByDate.get(key);
      if (!current || statusPriority[r.status] > statusPriority[current]) {
        myStatusByDate.set(key, r.status);
      }
    }

    const result: { date: string; status: ClientDayStatus }[] = [];
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const dateKey = toDateKey(d);
      const myStatus = myStatusByDate.get(dateKey);

      if (myStatus === "en_attente") { result.push({ date: dateKey, status: "jaune" }); continue; }
      if (myStatus === "confirmee") { result.push({ date: dateKey, status: "violet" }); continue; }
      if (myStatus === "terminee") { result.push({ date: dateKey, status: "bleu" }); continue; }

      const dayOfWeek = d.getDay();
      const workingHour = allWorkingHours.find((wh) => wh.day_of_week === dayOfWeek);
      const isClosed = !workingHour || !workingHour.is_working || blockedDateKeys.has(dateKey);
      result.push({ date: dateKey, status: isClosed ? "gris" : "neutre" });
    }
    return result;
  }

  // Phase F — calendrier AGENT (agrégé), corrigé pour inclure les horaires hebdo
  async getAgentMonthCalendar(agentId: number, year: number, month: number) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0);

    const [allWorkingHours, blockedDays, reservations] = await Promise.all([
      this.workingHoursRepository.findByAgentId(agentId),
      this.blockedSlotsRepository.findByAgentAndDateRange(agentId, from, to),
      this.reservationsRepository.findByAgentInRangeForCalendar(agentId, from, to),
    ]);

    const typeByDate = new Map(blockedDays.map((b) => [toDateKey(b.date), b.type]));
    const hasPending = new Set<string>();
    const hasAny = new Set<string>();
    for (const r of reservations) {
      const key = toDateKey(r.date_reservation);
      hasAny.add(key);
      if (r.status === "en_attente") hasPending.add(key);
    }

    const result: { date: string; status: AgentDayStatus }[] = [];
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const dateKey = toDateKey(d);
      const dayOfWeek = d.getDay();
      const workingHour = allWorkingHours.find((wh) => wh.day_of_week === dayOfWeek);
      const isWeeklyClosed = !workingHour || !workingHour.is_working;
      const exceptionType = typeByDate.get(dateKey);

      if (hasPending.has(dateKey)) { result.push({ date: dateKey, status: "jaune" }); continue; }
      if (exceptionType === "full") { result.push({ date: dateKey, status: "bleu" }); continue; }
      if (hasAny.has(dateKey)) { result.push({ date: dateKey, status: "violet" }); continue; }
      if (isWeeklyClosed || exceptionType === "off") { result.push({ date: dateKey, status: "rouge" }); continue; }
      result.push({ date: dateKey, status: "neutre" });
    }
    return result;
  }
}