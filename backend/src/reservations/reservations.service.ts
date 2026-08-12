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

  async createMyReservation(
    agentId: number,
    dateReservation: string,
    heureReservation: string,
    heureFinReservation: string,
    clientId: number,
    customRequest: string,
    serviceId: number
  ) {
    const service = await this.resolveServiceForReservation(agentId, serviceId);

    return this.reservationsRepository.createByClient({
      clientId,
      agentId,
      dateReservation,
      heureReservation,
      heureFinReservation,
      customRequest,
      serviceId,
      serviceNom: service.nom,
      servicePrix: service.prix,
    });
  }

  async createReservationByAdmin(dto: CreateReservationDto) {
    const service = await this.resolveServiceForReservation(
      dto.agentId,
      dto.serviceId
    );

    return this.reservationsRepository.create({
      ...dto,
      serviceNom: service.nom,
      servicePrix: service.prix,
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

  async updateAgentStatus(
    id: number,
    agentId: number,
    status: "confirmee" | "annulee"
  ) {
    const reservation = await this.reservationsRepository.findById(id);
    if (!reservation) {
      throw new NotFoundException("Réservation introuvable");
    }
    if (reservation.agent_id !== agentId) {
      throw new ForbiddenException("Cette réservation ne vous appartient pas");
    }
    if (reservation.status !== "en_attente") {
      throw new ConflictException("Cette réservation a déjà été traitée");
    }
    return await this.reservationsRepository.setStatus(id, status);
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
}
