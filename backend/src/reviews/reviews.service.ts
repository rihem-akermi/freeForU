// reviews.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { ReviewsRepository } from "./reviews.repository";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewsService {
  constructor(private reviewsRepository: ReviewsRepository) {}

  async createReview(dto: CreateReviewDto, clientId: number) {
    const reservation = await this.reviewsRepository.findReservationById(
      dto.reservation_id
    );

    if (!reservation) {
      throw new NotFoundException("Réservation introuvable");
    }

    if (reservation.client_id !== clientId) {
      throw new ForbiddenException("Cette réservation ne vous appartient pas");
    }

    if (reservation.status !== "terminee") {
      throw new BadRequestException(
        "Vous ne pouvez noter qu'une réservation terminée"
      );
    }

    const existingReview = await this.reviewsRepository.findByReservationId(
      dto.reservation_id
    );
    if (existingReview) {
      throw new ConflictException("Cette réservation a déjà été notée");
    }

    return await this.reviewsRepository.create({
      agent_id: reservation.agent_id,
      reservation_id: dto.reservation_id,
      client_id: clientId,
      rating: dto.rating,
      comment: dto.comment,
    });
  }

  async getAgentReviews(agentId: number) {
    return await this.reviewsRepository.findByAgentId(agentId);
  }

  async getAgentRatingSummary(agentId: number) {
    return await this.reviewsRepository.getAgentRatingSummary(agentId);
  }
}