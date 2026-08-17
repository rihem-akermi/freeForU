import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { WorkingHourDto } from "./dto/set-working-hours.dto";

@Injectable()
export class WorkingHoursRepository {
  constructor(private prisma: PrismaService) {}

  async findByAgentAndWeek(agentId: number) {
    return this.prisma.agent_working_hours.findMany({
      where: { agent_id: agentId},
      orderBy: { day_of_week: "asc" },
    });
  }

  async findByAgentId(agentId: number) {
    return this.prisma.agent_working_hours.findMany({
      where: { agent_id: agentId },
      orderBy: { day_of_week: "asc" },
    });
  }

  async upsertWeek(
    agentId: number,
    days: { dayOfWeek: number; isWorking: boolean; startTime?: string; endTime?: string }[]
  ) {
    return this.prisma.$transaction(
      days.map((d) =>
        this.prisma.agent_working_hours.upsert({
          where: { agent_id_day_of_week: { agent_id: agentId, day_of_week: d.dayOfWeek } },
          create: {
            agent_id: agentId,
            day_of_week: d.dayOfWeek,
            is_working: d.isWorking,
            start_time: d.startTime ? new Date(`1970-01-01T${d.startTime}:00`) : null,
            end_time: d.endTime ? new Date(`1970-01-01T${d.endTime}:00`) : null,
          },
          update: {
            is_working: d.isWorking,
            start_time: d.startTime ? new Date(`1970-01-01T${d.startTime}:00`) : null,
            end_time: d.endTime ? new Date(`1970-01-01T${d.endTime}:00`) : null,
          },
        })
      )
    );
  }

  
}
