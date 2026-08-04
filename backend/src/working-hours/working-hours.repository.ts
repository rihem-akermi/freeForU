// working-hours.repository.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { WorkingHourDto } from "./dto/set-working-hours.dto";

@Injectable()
export class WorkingHoursRepository {
  constructor(private prisma: PrismaService) {}

  async findByAgentId(agentId: number) {
    return this.prisma.agent_working_hours.findMany({
      where: { agent_id: agentId },
      orderBy: { day_of_week: "asc" },
    });
  }

  // upsert = crée si n'existe pas, met à jour sinon — utile ici grâce à la contrainte UNIQUE(agent_id, day_of_week)
  async upsert(agentId: number, dto: WorkingHourDto) {
    return this.prisma.agent_working_hours.upsert({
      where: {
        agent_id_day_of_week: { agent_id: agentId, day_of_week: dto.day_of_week },
      },
      update: {
        start_time: new Date(`1970-01-01T${dto.start_time}:00`),
        end_time: new Date(`1970-01-01T${dto.end_time}:00`),
      },
      create: {
        agent_id: agentId,
        day_of_week: dto.day_of_week,
        start_time: new Date(`1970-01-01T${dto.start_time}:00`),
        end_time: new Date(`1970-01-01T${dto.end_time}:00`),
      },
    });
  }

  async deleteDay(agentId: number, dayOfWeek: number) {
    return this.prisma.agent_working_hours.deleteMany({
      where: { agent_id: agentId, day_of_week: dayOfWeek },
    });
  }
}