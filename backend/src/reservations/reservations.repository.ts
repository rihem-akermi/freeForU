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
      },
      orderBy: { heure_reservation: "asc" },
    });
  }

  async findByAgentId(agentId: number) {
    return this.prisma.reservations.findMany({
      where: { agent_id: agentId },
      include: {
        users: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }

  async createByClient(
    dto: {
    clientId: number;
    agentId: number;
    dateReservation: string;
    heureReservation: string;
    heureFinReservation: string;
    customRequest: string;
    serviceId: number;
    serviceNom: string;
    servicePrix: number;
  }) {
    return this.prisma.reservations.create({
      data: {
        client_id: dto.clientId,
        agent_id: dto.agentId,
        date_reservation: new Date(dto.dateReservation),
        heure_reservation: new Date(`1970-01-01T${dto.heureReservation}:00`),
        heure_fin_reservation: new Date(
          `1970-01-01T${dto.heureFinReservation}:00`
        ),
        custom_request: dto.customRequest,
        service_id: dto.serviceId,
        service_nom: dto.serviceNom,
        service_prix: dto.servicePrix,
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
    heureFinReservation?: string;
    customRequest: string;
    serviceId?: number;
    serviceNom?: string;
    servicePrix?: number;
  }) {
    return this.prisma.reservations.create({
      data: {
        client_id: dto.clientId,
        agent_id: dto.agentId,
        date_reservation: new Date(dto.dateReservation),
        heure_reservation: new Date(`1970-01-01T${dto.heureReservation}:00`),
        ...(dto.heureFinReservation && {
          heure_fin_reservation: new Date(
            `1970-01-01T${dto.heureFinReservation}:00`
          ),
        }),
        custom_request: dto.customRequest,
        ...(dto.serviceId && { service_id: dto.serviceId }),
        ...(dto.serviceNom && { service_nom: dto.serviceNom }),
        ...(dto.servicePrix !== undefined && { service_prix: dto.servicePrix }),
        status: "en_attente",
      },
      include: { users: true, agents: true },
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

  async setStatus(id: number, status: string) {
    return this.prisma.reservations.update({
      where: { id },
      data: { status },
    });
  }

  async markAsTerminee(id: number) {
    return this.prisma.reservations.update({
      where: { id },
      data: { status: "terminee" },
    });
  }

}
