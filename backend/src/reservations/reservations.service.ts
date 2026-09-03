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
import { MailService } from "src/mail/mail.service"; 
import { Cron, CronExpression } from "@nestjs/schedule";
import { combineDateAndTime } from "src/common/utils/date.utils";

@Injectable()
export class ReservationsService {
  constructor(
    private reservationsRepository: reservationsRepository,
    private servicesRepository: ServicesRepository,
    private mailService: MailService 
  ) {}

  private async resolveServiceForReservation(
    agentId: number,
    serviceId: number
  ) {
    const service = await this.servicesRepository.findById(serviceId);
    if (!service) throw new NotFoundException("Service introuvable");
    if (service.agent_id !== agentId)
      throw new BadRequestException("Ce service n'appartient pas à cet agent");
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
      const service = await this.resolveServiceForReservation(
        dto.agentId,
        dto.serviceId!
      );
      serviceNom = service.nom;
      servicePrix = service.prix;
    }

    const created = await this.reservationsRepository.createByClient({
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

    // 📧 Notifier l'agent de la nouvelle demande
    if (created.agents?.email) {
      this.mailService.sendNewReservationToAgent(created.agents.email, {
        agentName: created.agents.name,
        clientName: created.users?.name ?? "Un client",
        serviceNom: created.service_nom,
        customRequest: created.custom_request,
        dateReservation: created.date_reservation.toLocaleDateString("fr-FR"),
        heureReservation:
          created.heure_reservation?.toTimeString().slice(0, 5) ?? null,
        heureFinReservation:
          created.heure_fin_reservation?.toTimeString().slice(0, 5) ?? null,
      });
    }

    return created;
  }

  async createReservationByAdmin(dto: CreateReservationDto) {
    const hasService = !!dto.serviceId;
    const hasCustom = !!dto.customRequest;
    if (hasService === hasCustom) {
      throw new BadRequestException(
        "Choisissez un service, ou une demande personnalisée"
      );
    }

    let serviceNom: string | undefined;
    let servicePrix: number | undefined;
    if (hasService) {
      const service = await this.resolveServiceForReservation(
        dto.agentId,
        dto.serviceId!
      );
      serviceNom = service.nom;
      servicePrix = service.prix;
    }

    return this.reservationsRepository.create({
      ...dto,
      serviceNom,
      servicePrix,
    });
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
    return await this.reservationsRepository.updateReservation(id, part);
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

    // 📧 Notifier le client (confirmée ou rejetée)
    if (reservation.users?.email) {
      const dateStr = reservation.date_reservation.toLocaleDateString("fr-FR");
      const heureStr =
        reservation.heure_reservation?.toTimeString().slice(0, 5) ?? null;

      if (status === "confirmee") {
        this.mailService.sendReservationConfirmed(reservation.users.email, {
          clientName: reservation.users.name,
          agentName: reservation.agents?.name ?? "l'agent",
          serviceNom: reservation.service_nom,
          dateReservation: dateStr,
          heureReservation: heureStr,
        });
      } else {
        this.mailService.sendReservationRejected(reservation.users.email, {
          clientName: reservation.users.name,
          agentName: reservation.agents?.name ?? "l'agent",
          serviceNom: reservation.service_nom,
          dateReservation: dateStr,
        });
      }
    }

    if (status === "confirmee" && reservation.heure_reservation) {
      const heureFin =
        reservation.heure_fin_reservation ??
        new Date(reservation.heure_reservation.getTime() + 60 * 60 * 1000);
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

  
  async cancelByClient(reservationId: number, clientId: number) {
    const reservation =
      await this.reservationsRepository.findById(reservationId);
    if (!reservation) throw new NotFoundException("Réservation introuvable");
    if (reservation.client_id !== clientId)
      throw new ForbiddenException("Cette réservation ne vous appartient pas");
    if (!["en_attente", "confirmee"].includes(reservation.status)) {
      throw new ConflictException("Cette réservation ne peut pas être annulée");
    }

    const reservationDateTime = combineDateAndTime(
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

    const updated = await this.reservationsRepository.setStatus(
      reservationId,
      "annulee"
    );

    // 📧 Notifier l'agent de l'annulation
    if (reservation.agents?.email) {
      this.mailService.sendReservationCancelledToAgent(
        reservation.agents.email,
        {
          agentName: reservation.agents.name,
          clientName: reservation.users?.name ?? "Un client",
          serviceNom: reservation.service_nom,
          dateReservation:
            reservation.date_reservation.toLocaleDateString("fr-FR"),
          heureReservation:
            reservation.heure_reservation?.toTimeString().slice(0, 5) ?? null,
        }
      );
    }

    return updated;
  }

  async deleteReservation(id: number) {
    return await this.reservationsRepository.delete(id);
  }

  async confirmCompletion(reservationId: number, userId: number, role: string) {
    const reservation =
      await this.reservationsRepository.findById(reservationId);
    if (!reservation) throw new NotFoundException("Réservation introuvable");
    if (reservation.status !== "confirmee") {
      throw new BadRequestException(
        "La réservation doit être confirmée avant de pouvoir être marquée terminée"
      );
    }

    if (role === "AGENT") {
      if (reservation.agent_id !== userId)
        throw new ForbiddenException(
          "Cette réservation ne vous appartient pas"
        );
      await this.reservationsRepository.setAgentConfirmed(reservationId);
    } else if (role === "CLIENT") {
      if (reservation.client_id !== userId)
        throw new ForbiddenException(
          "Cette réservation ne vous appartient pas"
        );
      await this.reservationsRepository.setClientConfirmed(reservationId);
    }

    const refreshedRes =
      await this.reservationsRepository.findById(reservationId);
    if (!refreshedRes)
      throw new NotFoundException("Réservation introuvable après mise à jour");

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

  // 📧 rappel 24h avant le RDV, tourne 1x/jour
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleReminders24h() {
    const tomorrow = new Date();
    //if 10h au lieu de 24h
    // const in10Hours = new Date(now.getTime() + 10 * 60 * 60 * 1000);    
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const toRemind =
      await this.reservationsRepository.findConfirmedForReminder(tomorrow);
    if (toRemind.length === 0) return;

    for (const r of toRemind) {
      const dateStr = r.date_reservation.toLocaleDateString("fr-FR");
      const heureStr = r.heure_reservation?.toTimeString().slice(0, 5) ?? null;

      if (r.users?.email) {
        this.mailService.sendReminder24h(r.users.email, {
          name: r.users.name,
          role: "client",
          otherPartyName: r.agents?.name ?? "l'agent",
          serviceNom: r.service_nom,
          dateReservation: dateStr,
          heureReservation: heureStr,
        });
      }
      if (r.agents?.email) {
        this.mailService.sendReminder24h(r.agents.email, {
          name: r.agents.name,
          role: "agent",
          otherPartyName: r.users?.name ?? "le client",
          serviceNom: r.service_nom,
          dateReservation: dateStr,
          heureReservation: heureStr,
        });
      }
    }

    await this.reservationsRepository.markRemindersSent(
      toRemind.map((r) => r.id)
    );
    console.log(`${toRemind.length} rappel(s) 24h envoyé(s)`);
  }
}
