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
    return this.prisma.reservations.findUnique({ where: {id : reservationId } });
  }
  async findByClientId(clientId: number) {
    return this.prisma.reservations.findMany({
      where: { client_id: clientId },
      include: {
        agents: {
          select: { id: true, name: true, ville: true, photo_url: true },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }
  async create(clientId: number, agentId: number, dateReservation: string) {
    const client = await this.prisma.users.findFirst({
      where: {
        id: clientId,
        role: "CLIENT",
      },
    });

    if (!client) {
      throw new BadRequestException(
        `Le client avec l'ID ${clientId} n'existe pas.`
      );
    }

    const agent = await this.prisma.agents.findUnique({
      where: {
        id: agentId,
      },
    });

    if (!agent) {
      throw new BadRequestException(
        `L'agent avec l'ID ${agentId} n'existe pas.`
      );
    }

    return this.prisma.reservations.create({
      data: {
        client_id: clientId,
        agent_id: agentId,
        date_reservation: new Date(dateReservation),
        status: "en_attente",
      },

      include: {
        users: true,
        agents: true,
      },
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

  async createByClient(dto: {
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
