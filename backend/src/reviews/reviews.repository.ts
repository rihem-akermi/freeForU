// reviews.repository.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ReviewsRepository {
  constructor(private prisma: PrismaService) {}

  async findReservationById(id: number) {
    return this.prisma.reservations.findUnique({ where: { id } });
  }

  async findByReservationId(reservationId: number) {
    return this.prisma.reviews.findUnique({
      where: { reservation_id: reservationId },
    });
  }

  async findByAgentId(agentId: number) {
    return this.prisma.reviews.findMany({
      where: { agent_id: agentId },
      orderBy: { created_at: "desc" },
    });
  }

  async create(data: {
    agent_id: number;
    reservation_id: number;
    client_id: number;
    rating: number;
    comment?: string;
  }) {
    return this.prisma.reviews.create({ data });
  }

  async getAgentRatingSummary(agentId: number) {
    const result = await this.prisma.reviews.aggregate({
      where: { agent_id: agentId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return {
      average: result._avg.rating ?? 0,
      count: result._count.rating,
    };
  }
}