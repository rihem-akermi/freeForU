// working-hours.service.ts
import { Injectable } from "@nestjs/common";
import { WorkingHoursRepository } from "./working-hours.repository";
import { WorkingHourDto } from "./dto/set-working-hours.dto";

@Injectable()
export class WorkingHoursService {
  constructor(private workingHoursRepository: WorkingHoursRepository) {}

  async getMyWorkingHours(agentId: number) {
    return await this.workingHoursRepository.findByAgentId(agentId);
  }

  async setWorkingHour(agentId: number, dto: WorkingHourDto) {
    if (dto.start_time >= dto.end_time) {
      throw new Error("L'heure de fin doit être après l'heure de début");
    }
    return await this.workingHoursRepository.upsert(agentId, dto);
  }

  async removeWorkingDay(agentId: number, dayOfWeek: number) {
    return await this.workingHoursRepository.deleteDay(agentId, dayOfWeek);
  }
}