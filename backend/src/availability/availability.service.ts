import { Injectable } from "@nestjs/common";
import { WorkingHoursRepository } from "src/working-hours/working-hours.repository";
import { BlockedSlotsRepository } from "src/blocked-slots/blocked-slots.repository";
import { reservationsRepository } from "src/reservations/reservations.repository";

type DayStatus = "rouge" | "orange" | "vert" | "sans_info";

// Retourne "YYYY-MM-DD" depuis une Date locale (sans décalage UTC)
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Retourne le dimanche de la semaine d'une date locale
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

@Injectable()
export class AvailabilityService {
  constructor(
    private workingHoursRepository: WorkingHoursRepository,
    private blockedSlotsRepository: BlockedSlotsRepository,
    private reservationsRepository: reservationsRepository
  ) {}

  private generateSlots(startTime: Date, endTime: Date): string[] {
    const slots: string[] = [];
    let current = startTime.getHours();
    const end = endTime.getHours();
    while (current < end) {
      slots.push(`${String(current).padStart(2, "0")}:00`);
      current++;
    }
    return slots;
  }

  private calculateDayAvailability(
    workingHour: { start_time: Date | null; end_time: Date | null },
    blockedSlots: { start_time: Date | null; end_time: Date | null }[],
    reservations: { heure_reservation: Date | null }[]
  ): { status: DayStatus; available_hours: string[] } {
    if (!workingHour.start_time || !workingHour.end_time) {
      return { status: "rouge", available_hours: [] };
    }

    let slots = this.generateSlots(workingHour.start_time, workingHour.end_time);
    const totalSlots = slots.length;

    const fullDayBlocked = blockedSlots.some((b) => !b.start_time);
    if (fullDayBlocked) return { status: "rouge", available_hours: [] };

    // Déplie chaque blocage partiel sur toute sa plage
    const blockedHours = blockedSlots
      .filter((b) => b.start_time)
      .flatMap((b) =>
        this.generateSlots(
          b.start_time as Date,
          b.end_time ?? new Date((b.start_time as Date).getTime() + 60 * 60 * 1000)
        )
      );

    const bookedHours = reservations
      .filter((r) => r.heure_reservation)
      .map((r) => `${String(r.heure_reservation!.getHours()).padStart(2, "0")}:00`);

    slots = slots.filter((s) => !blockedHours.includes(s) && !bookedHours.includes(s));

    const status: DayStatus =
      slots.length === 0 ? "rouge" : slots.length === totalSlots ? "vert" : "orange";

    return { status, available_hours: slots };
  }

  async getMonthCalendar(agentId: number, year: number, month: number) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0);

    const [allWorkingHours, blockedSlots, reservations] = await Promise.all([
      this.workingHoursRepository.findByAgentId(agentId), // toutes semaines
      this.blockedSlotsRepository.findByAgentAndDateRange(agentId, from, to),
      this.reservationsRepository.findByAgentAndDateRange(agentId, from, to),
    ]);

    const result: { date: string; status: DayStatus }[] = [];

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const dateKey = toDateKey(d);
      const dayOfWeek = d.getDay();

      // FIX 2 : on cherche l'horaire pour cette semaine précise + ce jour
      const weekStartKey = toDateKey(getWeekStart(d));
      const workingHour = allWorkingHours.find(
        (wh) =>
          wh.day_of_week === dayOfWeek &&
          toDateKey(new Date(wh.week_start)) === weekStartKey
      );

      if (!workingHour) {
        result.push({ date: dateKey, status: "sans_info" });
        continue;
      }
      if (!workingHour.is_working) {
        result.push({ date: dateKey, status: "rouge" });
        continue;
      }

      const availability = this.calculateDayAvailability(
        workingHour as { start_time: Date; end_time: Date },
        blockedSlots.filter((b) => toDateKey(b.date) === dateKey),
        reservations.filter((r) => toDateKey(r.date_reservation) === dateKey)
      );
      result.push({ date: dateKey, status: availability.status });
    }

    return result;
  }

  async getDayAvailability(agentId: number, dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dayOfWeek = date.getDay();
    const weekStartKey = toDateKey(getWeekStart(date));

    const [allWorkingHours, blockedSlots, reservations] = await Promise.all([
      this.workingHoursRepository.findByAgentId(agentId),
      this.blockedSlotsRepository.findByAgentAndDateRange(agentId, date, date),
      this.reservationsRepository.findByAgentAndDateRange(agentId, date, date),
    ]);

    const workingHour = allWorkingHours.find(
      (wh) =>
        wh.day_of_week === dayOfWeek &&
        toDateKey(new Date(wh.week_start)) === weekStartKey
    );

    if (!workingHour) {
      return { date: dateStr, status: "sans_info" as DayStatus, available_hours: [] };
    }
    if (!workingHour.is_working) {
      return { date: dateStr, status: "rouge" as DayStatus, available_hours: [] };
    }

    return {
      date: dateStr,
      ...this.calculateDayAvailability(
        workingHour as { start_time: Date; end_time: Date },
        blockedSlots,
        reservations
      ),
    };
  }
}
