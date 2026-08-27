import {
  Controller,
  Delete,
  Get,
  Body,
  Post,
  Param,
  Patch,
  ParseIntPipe,
  Req,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ReservationsService } from "./reservations.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { CreateMyReservationDto } from "./dto/create-my-reservation.dto";
import { UpdateAgentStatusDto } from "./dto/update-agent-status.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";

@ApiTags("Reservations")
@Controller("reservations")
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Lister mes réservations reçues (Agent connecté)",
    description: "Retourne toutes les réservations passées auprès de l'agent authentifié.",
  })
  @ApiResponse({ status: 200, description: "Liste des réservations reçues par l'agent." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("agent/me")
  async getMyReservationsAsAgent(@Req() req) {
    return this.reservationsService.getMyReservationsAsAgent(req.user.sub);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Lister mes réservations en attente (Agent connecté)",
    description: "Retourne les réservations reçues ayant le statut `en_attente`.",
  })
  @ApiResponse({ status: 200, description: "Liste des réservations en attente de l'agent." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("status/me")
  async getMyPendingReservationsAsAgent(@Req() req) {
    return this.reservationsService.getMyPendingReservationsAsAgent(
      req.user.sub
    );
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Lister mes réservations effectuées (Client connecté)",
    description: "Retourne les réservations passées par le client authentifié.",
  })
  @ApiResponse({ status: 200, description: "Liste des réservations du client." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle CLIENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("CLIENT")
  @Get("me")
  async getMyReservations(@Req() req) {
    return this.reservationsService.getMyReservations(req.user.sub);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Consulter les réservations d'un jour spécifique (Agent connecté)",
    description: "Retourne les réservations de l'agent pour une date précise (YYYY-MM-DD).",
  })
  @ApiQuery({ name: "date", description: "Date ciblée (YYYY-MM-DD)", example: "2026-09-10" })
  @ApiResponse({ status: 200, description: "Réservations de la journée." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("agent/me/day")
  async getMyDayReservations(@Req() req, @Query("date") date: string) {
    return this.reservationsService.getAgentDayReservations(req.user.sub, date);
  }

  @ApiOperation({
    summary: "Lister toutes les réservations de la plateforme",
    description: "Route listant l'historique complet des réservations.",
  })
  @ApiResponse({ status: 200, description: "Liste globale des réservations." })
  @Get()
  async getReservations() {
    const reservations = await this.reservationsService.getAllReservations();
    return reservations;
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Créer une réservation manuellement (Admin)",
    description: "Permet aux administrateurs de créer une réservation directement.",
  })
  @ApiResponse({ status: 201, description: "Réservation créée avec succès." })
  @ApiResponse({ status: 400, description: "Données de réservation invalides." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle ADMIN requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post()
  async addReservation(@Body() body: CreateReservationDto) {
    return await this.reservationsService.createReservationByAdmin({
      clientId: body.clientId,
      agentId: body.agentId,
      dateReservation: body.dateReservation,
      heureReservation: body.heureReservation,
      heureFinReservation: body.heureFinReservation,
      customRequest: body.customRequest,
      serviceId: body.serviceId,
    });
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Réserver un agent ou un service (Client connecté)",
    description: "Permet à un client de réserver un créneau auprès d'un agent.",
  })
  @ApiResponse({ status: 201, description: "Réservation créée en attente de confirmation agent." })
  @ApiResponse({ status: 400, description: "Créneau indisponible ou données invalides." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle CLIENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("CLIENT")
  @Post("me")
  async createMyReservation(@Req() req, @Body() body: CreateMyReservationDto) {
    return await this.reservationsService.createMyReservation(
      body,
      req.user.sub
    );
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Confirmer l'achèvement d'une prestation (Agent ou Client)",
    description:
      "Marque la prestation comme terminée par le client ou l'agent. Si les deux confirment, la réservation passe à `terminee`.",
  })
  @ApiParam({ name: "id", description: "ID de la réservation", example: 1 })
  @ApiResponse({ status: 200, description: "Confirmation enregistrée avec succès." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Non autorisé sur cette réservation." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT", "CLIENT")
  @Patch(":id/confirm-completion")
  async confirmCompletion(@Req() req, @Param("id", ParseIntPipe) id: number) {
    return this.reservationsService.confirmCompletion(
      id,
      req.user.sub,
      req.user.role
    );
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Annuler une réservation (Client connecté)",
    description: "Permet au client d'annuler sa réservation avant la prestation.",
  })
  @ApiParam({ name: "id", description: "ID de la réservation", example: 1 })
  @ApiResponse({ status: 200, description: "Réservation annulée avec succès." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle CLIENT requis ou réservation non détenue." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("CLIENT")
  @Patch(":id/cancel")
  async cancelReservation(@Req() req, @Param("id", ParseIntPipe) id: number) {
    return this.reservationsService.cancelByClient(id, req.user.sub);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Accepter ou refuser une réservation (Agent connecté)",
    description: "Permet à l'agent de confirmer (`confirmee`) ou rejeter (`rejetee`) une demande.",
  })
  @ApiParam({ name: "id", description: "ID de la réservation", example: 1 })
  @ApiResponse({ status: 200, description: "Statut de réservation mis à jour par l'agent." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Patch(":id/agent-status")
  async updateAgentStatus(
    @Req() req,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateAgentStatusDto
  ) {
    return this.reservationsService.updateAgentStatus(
      id,
      req.user.sub,
      body.status
    );
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Mettre à jour une réservation (Admin)",
    description: "Permet aux administrateurs de modifier les informations ou statut d'une réservation.",
  })
  @ApiParam({ name: "id", description: "ID de la réservation", example: 1 })
  @ApiResponse({ status: 200, description: "Réservation mise à jour avec succès." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle ADMIN requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Patch(":id")
  async updateReservation(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateReservationDto
  ) {
    return await this.reservationsService.updateReservation(id, body);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Supprimer une réservation (Admin)",
    description: "Supprime définitivement une réservation de la plateforme.",
  })
  @ApiParam({ name: "id", description: "ID de la réservation", example: 1 })
  @ApiResponse({ status: 200, description: "Réservation supprimée avec succès." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle ADMIN requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Delete(":id")
  async deleteReservation(@Param("id", ParseIntPipe) id: number) {
    return await this.reservationsService.deleteReservation(id);
  }
}
