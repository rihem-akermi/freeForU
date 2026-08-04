// blocked-slots.repository.ts
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

  async create(agentId: number, dto: CreateBlockedSlotDto) {
    return this.prisma.agent_blocked_slots.create({
      data: {
        agent_id: agentId,
        date: new Date(dto.date),
        start_time: dto.start_time ? new Date(`1970-01-01T${dto.start_time}:00`) : null,
        end_time: dto.end_time ? new Date(`1970-01-01T${dto.end_time}:00`) : null,
        reason: dto.reason,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.agent_blocked_slots.delete({ where: { id } });
  }

  async findById(id: number) {
    return this.prisma.agent_blocked_slots.findUnique({ where: { id } });
  }
}