import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBlockedSlotDto } from "./dto/create-blocked-slot.dto";

@Injectable()
export class BlockedSlotsRepository {
  constructor(private prisma: PrismaService) {}

  async findByAgentId(agentId: number) {
    return this.prisma.agent_blocked_slots.findMany({
      where: { agent_id: agentId },
      orderBy: { date: "asc" },
    });
  }

  async findByAgentAndDateRange(agentId: number, from: Date, to: Date) {
    return this.prisma.agent_blocked_slots.findMany({
      where: { agent_id: agentId, date: { gte: from, lte: to } },
    });
  }

  async findByAgentAndDate(agentId: number, date: Date) {
    return this.prisma.agent_blocked_slots.findFirst({
      where: { agent_id: agentId, date },
    });
  }

  async create(
    agentId: number,
    dto: { date: string; type: "off" | "full"; reason?: string }
  ) {
    return this.prisma.agent_blocked_slots.create({
      data: {
        agent_id: agentId,
        date: new Date(dto.date),
        type: dto.type,
        reason: dto.reason,
      },
    });
  }

  async updateType(id: number, type: "off" | "full") {
    return this.prisma.agent_blocked_slots.update({
      where: { id },
      data: { type },
    });
  }

  async delete(id: number) {
    return this.prisma.agent_blocked_slots.delete({ where: { id } });
  }

  async findById(id: number) {
    return this.prisma.agent_blocked_slots.findUnique({ where: { id } });
  }
}
