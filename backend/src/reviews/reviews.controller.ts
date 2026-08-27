// reviews.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
  Delete,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
} from "@nestjs/swagger";

@ApiTags("Reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Lister tous les avis (Admin)",
    description: "Retourne la liste complète de tous les avis déposés sur la plateforme.",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des avis retournée avec succès.",
  })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle ADMIN requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Get()
  async getAllReviews() {
    return this.reviewsService.getAllReviews();
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Supprimer un avis (Admin)",
    description: "Supprime définitivement un avis par son ID.",
  })
  @ApiParam({ name: "id", description: "ID de l'avis", example: 1 })
  @ApiResponse({
    status: 200,
    description: "Avis supprimé avec succès.",
  })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle ADMIN requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Delete(":id")
  async deleteReview(@Param("id", ParseIntPipe) id: number) {
    return this.reviewsService.deleteReview(id);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Déposer un avis sur une réservation terminée (Client)",
    description: "Permet au client connecté de noter (1-5) et commenter une réservation terminée.",
  })
  @ApiResponse({
    status: 201,
    description: "Avis enregistré avec succès.",
  })
  @ApiResponse({ status: 400, description: "Données d'avis invalides." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle CLIENT requis ou réservation non terminée." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("CLIENT")
  @Post()
  async createReview(@Req() req, @Body() body: CreateReviewDto) {
    return this.reviewsService.createReview(body, req.user.sub);
  }

  @ApiOperation({
    summary: "Obtenir le récapitulatif des notes d'un agent",
    description: "Route publique retournant la note moyenne et le nombre total d'avis pour un agent.",
  })
  @ApiParam({ name: "agentId", description: "ID de l'agent", example: 1 })
  @ApiResponse({
    status: 200,
    description: "Résumé des notes de l'agent (moyenne et total).",
  })
  @Get("agent/:agentId/summary")
  async getAgentRatingSummary(@Param("agentId", ParseIntPipe) agentId: number) {
    return this.reviewsService.getAgentRatingSummary(agentId);
  }

  @ApiOperation({
    summary: "Lister les avis d'un agent",
    description: "Route publique listant tous les avis et commentaires reçus par un agent.",
  })
  @ApiParam({ name: "agentId", description: "ID de l'agent", example: 1 })
  @ApiResponse({
    status: 200,
    description: "Liste des avis de l'agent.",
  })
  @Get("agent/:agentId")
  async getAgentReviews(@Param("agentId", ParseIntPipe) agentId: number) {
    return this.reviewsService.getAgentReviews(agentId);
  }
}
