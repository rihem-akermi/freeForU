import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { reservationsRepository } from "./reservations.repository";
import { UpdateReservationDto } from "./dto/update-reservation.dto";

@Injectable()
export class ReservationsService {
  constructor(private reservationsRepository: reservationsRepository) {}

  async createReservation(dto: {
    clientId: number;
    agentId: number;
    dateReservation: string;
    heureReservation: string;
    offerId?: number;
    customRequest?: string;
  }) {
    return await this.reservationsRepository.create(dto);
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

  async createMyReservation(
    agentId: number,
    dateReservation: string,
    heureReservation: string,
    clientId: number,
    offerId?: number,
    customRequest?: string
  ) {
    this.validateOfferOrCustomRequest(offerId, customRequest);

    const conflict = await this.reservationsRepository.findConflict(
      agentId,
      dateReservation,
      heureReservation
    );
    if (conflict) {
      throw new ConflictException(
        "Ce créneau vient d'être réservé par quelqu'un d'autre, choisissez-en un autre"
      );
    }

    return await this.createReservation({
      clientId,
      agentId,
      dateReservation,
      heureReservation,
      offerId,
      customRequest,
    });
  }

  async updateReservation(id: number, part: UpdateReservationDto) {
    const VALID_STATUSES = ["en_attente", "confirmee", "terminee", "annulee"];

    if (part.status && !VALID_STATUSES.includes(part.status)) {
      throw new BadRequestException(`Status invalide : ${part.status}`);
    }
    const updated = await this.reservationsRepository.updateReservation(
      id,
      part
    );
    return updated;
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

  private validateOfferOrCustomRequest(
    offerId?: number,
    customRequest?: string
  ) {
    if (!offerId && !customRequest) {
      throw new BadRequestException(
        "Vous devez fournir soit une offre existante, soit une demande personnalisée"
      );
    }
    if (offerId && customRequest) {
      throw new BadRequestException(
        "Vous ne pouvez pas fournir à la fois une offre et une demande personnalisée"
      );
    }
  }

  async createReservationByAdmin(dto: {
    clientId: number;
    agentId: number;
    dateReservation: string;
    heureReservation: string;
    offerId?: number;
    customRequest?: string;
  }) {
    this.validateOfferOrCustomRequest(dto.offerId, dto.customRequest);
    const conflict = await this.reservationsRepository.findConflict(
      dto.agentId,
      dto.dateReservation,
      dto.heureReservation
    );
    if (conflict) {
      throw new ConflictException(
        "Ce créneau vient d'être réservé par quelqu'un d'autre, choisissez-en un autre"
      );
    }
    return await this.createReservation(dto);
  }
}
