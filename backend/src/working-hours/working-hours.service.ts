import { Injectable, BadRequestException } from "@nestjs/common";
import { WorkingHoursRepository } from "./working-hours.repository";
import { WorkingHourDto } from "./dto/set-working-hours.dto";

// Renvoie le dimanche (début de semaine) d'une date donnée
function getWeekStart(dateStr: string): Date {
  const date = new Date(dateStr);
  const day = date.getUTCDay(); // 0 = dimanche
  const diff = date.getUTCDate() - day;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), diff));
}

@Injectable()
export class WorkingHoursService {
  constructor(private workingHoursRepository: WorkingHoursRepository) {}

  // GET /working-hours/me?week_start=2026-08-02
  async getMyWorkingHours(agentId: number, weekStartStr: string) {
    const weekStart = getWeekStart(weekStartStr);
    return await this.workingHoursRepository.findByAgentAndWeek(agentId, weekStart);
  }

  // PUT /working-hours/me — body contient week_start
  async setWorkingHour(agentId: number, dto: WorkingHourDto) {
    if (!dto.week_start) {
      throw new BadRequestException("week_start est requis");
    }
    if (dto.is_working && dto.start_time && dto.end_time && dto.start_time >= dto.end_time) {
      throw new BadRequestException("L'heure de fin doit être après l'heure de début");
    }
    if (dto.is_working && (!dto.start_time || !dto.end_time)) {
      throw new BadRequestException("start_time et end_time sont requis quand is_working est true");
    }
    const weekStart = getWeekStart(dto.week_start);
    return await this.workingHoursRepository.upsert(agentId, weekStart, dto);
  }

  async removeWorkingDay(agentId: number, weekStartStr: string, dayOfWeek: number) {
    const weekStart = getWeekStart(weekStartStr);
    return await this.workingHoursRepository.deleteDay(agentId, weekStart, dayOfWeek);
  }
}
