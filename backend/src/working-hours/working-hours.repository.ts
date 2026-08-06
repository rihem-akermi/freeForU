import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { WorkingHourDto } from "./dto/set-working-hours.dto";

@Injectable()
export class WorkingHoursRepository {
  constructor(private prisma: PrismaService) {}

  // FIX 2 : récupère les horaires d'une semaine précise (week_start = dimanche)
  async findByAgentAndWeek(agentId: number, weekStart: Date) {
    return this.prisma.agent_working_hours.findMany({
      where: { agent_id: agentId, week_start: weekStart },
      orderBy: { day_of_week: "asc" },
    });
  }

  // Utilisé par availability.service pour calculer les couleurs du mois :
  // récupère TOUS les horaires de l'agent (toutes semaines confondues)
  async findByAgentId(agentId: number) {
    return this.prisma.agent_working_hours.findMany({
      where: { agent_id: agentId },
      orderBy: [{ week_start: "asc" }, { day_of_week: "asc" }],
    });
  }

  async upsert(agentId: number, weekStart: Date, dto: WorkingHourDto) {
    return this.prisma.agent_working_hours.upsert({
      where: {
        agent_id_week_start_day_of_week: {
          agent_id: agentId,
          week_start: weekStart,
          day_of_week: dto.day_of_week,
        },
      },
      update: {
        is_working: dto.is_working,
        start_time: dto.start_time ? new Date(`1970-01-01T${dto.start_time}:00`) : null,
        end_time: dto.end_time ? new Date(`1970-01-01T${dto.end_time}:00`) : null,
      },
      create: {
        agent_id: agentId,
        week_start: weekStart,
        day_of_week: dto.day_of_week,
        is_working: dto.is_working,
        start_time: dto.start_time ? new Date(`1970-01-01T${dto.start_time}:00`) : null,
        end_time: dto.end_time ? new Date(`1970-01-01T${dto.end_time}:00`) : null,
      },
    });
  }

  async deleteDay(agentId: number, weekStart: Date, dayOfWeek: number) {
    return this.prisma.agent_working_hours.deleteMany({
      where: { agent_id: agentId, week_start: weekStart, day_of_week: dayOfWeek },
    });
  }
}
