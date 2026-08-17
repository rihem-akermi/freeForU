import { Injectable } from "@nestjs/common";
import { WorkingHoursRepository } from "./working-hours.repository";
import { UpdateWorkingHoursDto } from "./dto/update-working-hours.dto";

@Injectable()
export class WorkingHoursService {
  constructor(private workingHoursRepository: WorkingHoursRepository) {}

  async getByAgentId(agentId: number) {
    return this.workingHoursRepository.findByAgentId(agentId);
  }

  async updateMyWorkingHours(agentId: number, dto: UpdateWorkingHoursDto) {
    return this.workingHoursRepository.upsertWeek(agentId, dto.days);
  }
}