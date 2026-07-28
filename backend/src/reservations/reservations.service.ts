import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { reservationsRepository } from "./reservations.repository";
import { UpdateReservationDto } from "./dto/update-reservation.dto";

@Injectable()
export class ReservationsService {
  constructor(private reservationsRepository: reservationsRepository) {}

  async getAllReservations() {
    return await this.reservationsRepository.findAll();
  }

  async createReservation(
    clientId: number,
    agentId: number,
    dateReservation: string
  ) {
    const newRes = await this.reservationsRepository.create(
      clientId,
      agentId,
      dateReservation
    );
    return newRes;
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

    const refreshedRes = await this.reservationsRepository.findById(reservationId);

    if (!refreshedRes) {
      // if (!x) throw ... au lieu de x?. 
      throw new NotFoundException("Réservation introuvable après mise à jour");
    }

    if (refreshedRes.agent_confirmed && refreshedRes.client_confirmed) {
      return await this.reservationsRepository.markAsTerminee(reservationId);
    }

    return refreshedRes;
  }

  private validateOfferOrCustomRequest(offerId?: number, customRequest?: string) {
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
  offerId?: number;
  customRequest?: string;
}) {
  this.validateOfferOrCustomRequest(dto.offerId, dto.customRequest);
  return await this.reservationsRepository.createByAdmin(dto);
}

async createMyReservation(
  agentId: number,
  dateReservation: string,
  clientId: number,
  offerId?: number,
  customRequest?: string
) {
  this.validateOfferOrCustomRequest(offerId, customRequest);
  return await this.reservationsRepository.createByClient({
    clientId,
    agentId,
    dateReservation,
    offerId,
    customRequest,
  });
}
}
