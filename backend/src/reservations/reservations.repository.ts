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

  async findByClientId(clientId: number) {
    return this.prisma.reservations.findMany({
      where: { client_id: clientId }, // archived retiré
      include: {
        agents: {
          select: { id: true, name: true, ville: true, photo_url: true },
        },
        reviews: { select: { id: true, rating: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }

  async findByAgentId(agentId: number) {
    return this.prisma.reservations.findMany({
      where: { agent_id: agentId }, // archived retiré
      include: {
        users: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }

  async findById(reservationId: number) {
    return this.prisma.reservations.findUnique({
      where: { id: reservationId },
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
        archived: false,
      },
      include: {
        users: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
      orderBy: { heure_reservation: "asc" },
    });
  }


  async findPendingReservationsByAgentId(agentId: number) {
    return this.prisma.reservations.findMany({
      where: { agent_id: agentId, archived: false, status: "en_attente" },
      include: {
        users: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }

  async findExpiredPending() {
    const now = new Date();

    return this.prisma.reservations.findMany({
      where: {
        status: "en_attente",
        OR: [
          { date_reservation: { lt: new Date(now.toDateString()) } },
          {
            date_reservation: { equals: new Date(now.toDateString()) },
            heure_reservation: {
              lt: new Date(`1970-01-01T${now.toTimeString().slice(0, 8)}`),
            },
          },
        ],
      },
    });
  }

  async findToArchive() {
    //le Cron pour l'appeler périodiquement pour chercher qui ont été updated depuis 1h  
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    return this.prisma.reservations.findMany({
      where: {
        status: { in: ["rejetee", "annulee" , "expiree"] },
        archived: false,
        updated_at: { lte: oneHourAgo },
      },
    });
  }

  async findByClientAndAgentInRange(
    clientId: number,
    agentId: number,
    from: Date,
    to: Date
  ) {
    return this.prisma.reservations.findMany({
      where: {
        client_id: clientId,
        agent_id: agentId,
        date_reservation: { gte: from, lte: to },
        status: { in: ["en_attente", "confirmee", "terminee"] }, 
        archived: false,
      },
      select: { date_reservation: true, status: true },
    });
  }

  async findOverlappingPending(
    agentId: number,
    date: Date,
    heureDebut: Date,
    heureFin: Date,
    excludeId: number
  ) {
    const pending = await this.prisma.reservations.findMany({
      where: {
        agent_id: agentId,
        date_reservation: date,
        status: "en_attente",
        id: { not: excludeId },
      },
    });

    return pending.filter((r) => {
      if (!r.heure_reservation) return false;
      const rHeureFin =
        r.heure_fin_reservation ??
        new Date(r.heure_reservation.getTime() + 60 * 60 * 1000);
      return heureDebut < rHeureFin && r.heure_reservation < heureFin;
    });
  }

  async markManyAsRejected(ids: number[]) {
    if (ids.length === 0) return;
    return this.prisma.reservations.updateMany({
      where: { id: { in: ids } },
      data: { status: "rejetee" },
    });
  }

  async findByAgentInRangeForCalendar(agentId: number, from: Date, to: Date) {
    return this.prisma.reservations.findMany({
      where: {
        agent_id: agentId,
        date_reservation: { gte: from, lte: to },
        status: { in: ["en_attente", "confirmee", "terminee"] },
        archived: false,
      },
      select: { date_reservation: true, status: true },
    });
  }
  async archiveMany(ids: number[]) {
    return this.prisma.reservations.updateMany({
      where: { id: { in: ids } },
      data: { archived: true },
    });
  }

  async markManyAsExpired(ids: number[]) {
    return this.prisma.reservations.updateMany({
      where: { id: { in: ids } },
      data: { status: "expiree" },
    });
  }

  async createByClient(dto: {
    clientId: number;
    agentId: number;
    dateReservation: string;
    heureReservation: string;
    heureFinReservation?: string;
    customRequest?: string;
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
        ...(dto.customRequest && { custom_request: dto.customRequest }),
        ...(dto.serviceId && { service_id: dto.serviceId }),
        ...(dto.serviceNom && { service_nom: dto.serviceNom }),
        ...(dto.servicePrix !== undefined && { service_prix: dto.servicePrix }),
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
    customRequest?: string;
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
        ...(dto.customRequest && { custom_request: dto.customRequest }),
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
