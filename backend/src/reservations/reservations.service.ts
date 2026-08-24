import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { reservationsRepository } from "./reservations.repository";
import { UpdateReservationDto } from "./dto/update-reservation.dto";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { ServicesRepository } from "src/services/services.repository";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ReservationsService {
  constructor(
    private reservationsRepository: reservationsRepository,
    private servicesRepository: ServicesRepository
  ) {}

  private async resolveServiceForReservation(
    agentId: number,
    serviceId: number
  ) {
    const service = await this.servicesRepository.findById(serviceId);

    if (!service) {
      throw new NotFoundException("Service introuvable");
    }
    if (service.agent_id !== agentId) {
      throw new BadRequestException("Ce service n'appartient pas à cet agent");
    }

    return service;
  }

  async getAllReservations() {
    return await this.reservationsRepository.findAll();
  }

  async getMyReservations(clientId: number) {
    return await this.reservationsRepository.findByClientId(clientId);
  }

  async getAgentDayReservations(agentId: number, dateStr: string) {
    const date = new Date(dateStr);
    return await this.reservationsRepository.findByAgentAndDate(agentId, date);
  }

  async getMyReservationsAsAgent(agentId: number) {
    return await this.reservationsRepository.findByAgentId(agentId);
  }

  async getMyPendingReservationsAsAgent(agentId: number) {
    return await this.reservationsRepository.findPendingReservationsByAgentId(
      agentId
    );
  }

 async createMyReservation(
  dto: {
    agentId: number;
    serviceId?: number;
    customRequest?: string;
    dateReservation: string;
    heureReservation: string;
    heureFinReservation?: string;
  },
  clientId: number
) {
  const hasService = !!dto.serviceId;
  const hasCustom = !!dto.customRequest;
  if (hasService === hasCustom) {
    throw new BadRequestException(
      "Choisissez un service, ou décrivez votre besoin — pas les deux, pas aucun des deux"
    );
  }

  let serviceNom: string | undefined;
  let servicePrix: number | undefined;
  if (hasService) {
    const service = await this.resolveServiceForReservation(dto.agentId, dto.serviceId!);
    serviceNom = service.nom;
    servicePrix = service.prix;
  }

  return this.reservationsRepository.createByClient({
    clientId,
    agentId: dto.agentId,
    dateReservation: dto.dateReservation,
    heureReservation: dto.heureReservation,
    heureFinReservation: dto.heureFinReservation,
    customRequest: dto.customRequest,
    serviceId: dto.serviceId,
    serviceNom,
    servicePrix,
  });
}

async createReservationByAdmin(dto: CreateReservationDto) {
  const hasService = !!dto.serviceId;
  const hasCustom = !!dto.customRequest;
  if (hasService === hasCustom) {
    throw new BadRequestException("Choisissez un service, ou une demande personnalisée");
  }

  let serviceNom: string | undefined;
  let servicePrix: number | undefined;
  if (hasService) {
    const service = await this.resolveServiceForReservation(dto.agentId, dto.serviceId!);
    serviceNom = service.nom;
    servicePrix = service.prix;
  }

  return this.reservationsRepository.create({ ...dto, serviceNom, servicePrix });
}
  async updateReservation(id: number, part: UpdateReservationDto) {
    const VALID_STATUSES = [
      "en_attente",
      "confirmee",
      "terminee",
      "rejetee",
      "annulee",
      "expiree",
    ];

    if (part.status && !VALID_STATUSES.includes(part.status)) {
      throw new BadRequestException(`Status invalide : ${part.status}`);
    }
    const updated = await this.reservationsRepository.updateReservation(
      id,
      part
    );
    return updated;
  }

  async updateAgentStatus(
    id: number,
    agentId: number,
    status: "confirmee" | "rejetee"
  ) {
    const reservation = await this.reservationsRepository.findById(id);
    if (!reservation) throw new NotFoundException("Réservation introuvable");
    if (reservation.agent_id !== agentId)
      throw new ForbiddenException("Cette réservation ne vous appartient pas");
    if (reservation.status !== "en_attente")
      throw new ConflictException("Cette réservation a déjà été traitée");

    const updated = await this.reservationsRepository.setStatus(id, status);

    if (status === "confirmee" && reservation.heure_reservation) {
      const heureFin =
        reservation.heure_fin_reservation ??
        new Date(reservation.heure_reservation.getTime() + 60 * 60 * 1000); // +1h par défaut

      const overlapping =
        await this.reservationsRepository.findOverlappingPending(
          agentId,
          reservation.date_reservation,
          reservation.heure_reservation,
          heureFin,
          id
        );
      if (overlapping.length > 0) {
        await this.reservationsRepository.markManyAsRejected(
          overlapping.map((r) => r.id)
        );
      }
    }

    return updated;
  }

  private combineDateAndTime(date: Date, time: Date | null): Date {
    const combined = new Date(date);
    if (time) {
      combined.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
    }
    return combined;
  }

  async cancelByClient(reservationId: number, clientId: number) {
    const reservation =
      await this.reservationsRepository.findById(reservationId);

    if (!reservation) {
      throw new NotFoundException("Réservation introuvable");
    }
    if (reservation.client_id !== clientId) {
      throw new ForbiddenException("Cette réservation ne vous appartient pas");
    }
    if (!["en_attente", "confirmee"].includes(reservation.status)) {
      throw new ConflictException("Cette réservation ne peut pas être annulée");
    }

    const reservationDateTime = this.combineDateAndTime(
      reservation.date_reservation,
      reservation.heure_reservation
    );
    const hoursUntilReservation =
      (reservationDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilReservation < 24) {
      throw new BadRequestException(
        "Impossible d'annuler moins de 24h avant le rendez-vous"
      );
    }

    return this.reservationsRepository.setStatus(reservationId, "annulee");
  }

  async deleteReservation(id: number) {
    const deletedReservation = await this.reservationsRepository.delete(id);
    return deletedReservation;
  }

  async confirmCompletion(reservationId: number, userId: number, role: string) {
    const reservation =
      await this.reservationsRepository.findById(reservationId);

    if (!reservation) {
      throw new NotFoundException("Réservation introuvable");
    }

    if (reservation.status !== "confirmee") {
      throw new BadRequestException(
        "La réservation doit être confirmée avant de pouvoir être marquée terminée"
      );
    }

    if (role === "AGENT") {
      if (reservation.agent_id !== userId) {
        throw new ForbiddenException(
          "Cette réservation ne vous appartient pas"
        );
      }
      await this.reservationsRepository.setAgentConfirmed(reservationId);
    } else if (role === "CLIENT") {
      if (reservation.client_id !== userId) {
        throw new ForbiddenException(
          "Cette réservation ne vous appartient pas"
        );
      }
      await this.reservationsRepository.setClientConfirmed(reservationId);
    }

    const refreshedRes =
      await this.reservationsRepository.findById(reservationId);

    if (!refreshedRes) {
      // if (!x) throw ... au lieu de x?.
      throw new NotFoundException("Réservation introuvable après mise à jour");
    }

    if (refreshedRes.agent_confirmed && refreshedRes.client_confirmed) {
      return await this.reservationsRepository.markAsTerminee(reservationId);
    }

    return refreshedRes;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredReservations() {
    const expired = await this.reservationsRepository.findExpiredPending();
    if (expired.length > 0) {
      const ids = expired.map((r) => r.id);
      await this.reservationsRepository.markManyAsExpired(ids);
      console.log(`${ids.length} réservation(s) passée(s) en "expiree"`);
    }

    const toArchive = await this.reservationsRepository.findToArchive();
    if (toArchive.length > 0) {
      const ids = toArchive.map((r) => r.id);
      await this.reservationsRepository.archiveMany(ids);
      console.log(`${ids.length} réservation(s) archivée(s)`);
    }
  }
}
