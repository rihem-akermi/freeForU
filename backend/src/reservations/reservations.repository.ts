import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class reservationsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.reservations.findMany({
      include: {
        users: {
          select: {
            name: true,
            phone: true,
            email: true,
            ville: true,
          },
        },

        agents: {
          select: {
            name: true,
            phone: true,
            email: true,
            ville: true,
          },
        },
      },

      orderBy: {
        created_at: "desc",
      },
    });
  }

  async findById(reservationId: number) {
    return this.prisma.reservations.findUnique({
      where: { id: reservationId },
    });
  }
  async findByClientId(clientId: number) {
    return this.prisma.reservations.findMany({
      where: { client_id: clientId },
      include: {
        agents: {
          select: { id: true, name: true, ville: true, photo_url: true },
        },
        offers: { select: { id: true, title: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }
  async findByAgentAndDateRange(agentId: number, from: Date, to: Date) {
    return this.prisma.reservations.findMany({
      where: {
        agent_id: agentId,
        date_reservation: { gte: from, lte: to },
        status: { not: "annulee" },
      },
    });
  }

  async findByAgentAndDate(agentId: number, date: Date) {
    return this.prisma.reservations.findMany({
      where: {
        agent_id: agentId,
        date_reservation: date,
        status: { not: "annulee" },
      },
      include: {
        users: {
          select: { id: true, name: true, phone: true, email: true },
        },
        offers: {
          select: { id: true, title: true },
        },
      },
      orderBy: { heure_reservation: "asc" },
    });
  }

  async findConflict(agentId: number, date: string, heure: string) {
    return this.prisma.reservations.findFirst({
      where: {
        agent_id: agentId,
        date_reservation: new Date(date),
        heure_reservation: new Date(`1970-01-01T${heure}:00`),
        status: { not: "annulee" },
      },
    });
  }

  async createByClient(dto: {
    clientId: number;
    agentId: number;
    dateReservation: string;
    heureReservation: string;
    offerId?: number;
    customRequest?: string;
  }) {
    return this.prisma.reservations.create({
      data: {
        client_id: dto.clientId,
        agent_id: dto.agentId,
        date_reservation: new Date(dto.dateReservation),
        heure_reservation: new Date(`1970-01-01T${dto.heureReservation}:00`),
        offer_id: dto.offerId,
        custom_request: dto.customRequest,
        status: "en_attente",
      },
      include: { users: true, agents: true },
    });
  }
  async create(dto: {
  clientId: number;
  agentId: number;
  dateReservation: string;
  heureReservation: string;
  offerId?: number;
  customRequest?: string;
}) {
  return this.prisma.reservations.create({
    data: {
      client_id: dto.clientId,
      agent_id: dto.agentId,
      date_reservation: new Date(dto.dateReservation),
      heure_reservation: new Date(`1970-01-01T${dto.heureReservation}:00`),
      offer_id: dto.offerId,
      custom_request: dto.customRequest,
      status: "en_attente",
    },
    include: { users: true, agents: true, offers: true },
  });
}

  async updateReservation(
    id: number,
    part: {
      status?: string;
      date_reservation?: string;
    }
  ) {
    return this.prisma.reservations.update({
      where: {
        id,
      },

      data: {
        ...part,

        ...(part.date_reservation && {
          date_reservation: new Date(part.date_reservation),
        }),
      },
    });
  }

  async delete(id: number) {
    return this.prisma.reservations.delete({
      where: {
        id,
      },
    });
  }

  async setAgentConfirmed(id: number) {
    return this.prisma.reservations.update({
      where: { id },
      data: { agent_confirmed: true },
    });
  }

  async setClientConfirmed(id: number) {
    return this.prisma.reservations.update({
      where: { id },
      data: { client_confirmed: true },
    });
  }

  async markAsTerminee(id: number) {
    return this.prisma.reservations.update({
      where: { id },
      data: { status: "terminee" },
    });
  }

  async createByAdmin(dto: {
    clientId: number;
    agentId: number;
    dateReservation: string;
    offerId?: number;
    customRequest?: string;
  }) {
    return this.prisma.reservations.create({
      data: {
        client_id: dto.clientId,
        agent_id: dto.agentId,
        date_reservation: new Date(dto.dateReservation),
        offer_id: dto.offerId,
        custom_request: dto.customRequest,
        status: "en_attente",
      },
      include: { users: true, agents: true },
    });
  }
}
