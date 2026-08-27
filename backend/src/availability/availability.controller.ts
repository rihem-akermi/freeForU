import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Req,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { AvailabilityService } from "./availability.service";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";

@ApiTags("Availability")
@Controller("availability")
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @ApiOperation({
    summary: "Consulter les disponibilités journalières d’un agent",
    description: "Route publique calculant les créneaux disponibles pour une date donnée (YYYY-MM-DD).",
  })
  @ApiParam({ name: "agentId", description: "ID de l'agent", example: 1 })
  @ApiQuery({ name: "date", description: "Date ciblée (YYYY-MM-DD)", example: "2026-09-10" })
  @ApiResponse({
    status: 200,
    description: "Détail de la disponibilité (heures de travail, réservations, créneaux libres).",
  })
  @Get("agent/:agentId/day")
  async getDayAvailability(
    @Param("agentId", ParseIntPipe) agentId: number,
    @Query("date") date: string
  ) {
    return this.availabilityService.getDayAvailability(agentId, date);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Consulter le calendrier mensuel d’un agent avec statut client",
    description:
      "Fournit le calendrier du mois en indiquant les statuts de réservation pour le client connecté.",
  })
  @ApiParam({ name: "agentId", description: "ID de l'agent", example: 1 })
  @ApiQuery({ name: "year", description: "Année (ex: 2026)", example: 2026 })
  @ApiQuery({ name: "month", description: "Mois (1 à 12)", example: 9 })
  @ApiResponse({
    status: 200,
    description: "Calendrier mensuel enrichi pour le client.",
  })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle CLIENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("CLIENT")
  @Get("agent/:agentId/client-calendar")
  async getClientMonthCalendar(
    @Req() req,
    @Param("agentId", ParseIntPipe) agentId: number,
    @Query("year", ParseIntPipe) year: number,
    @Query("month", ParseIntPipe) month: number
  ) {
    return this.availabilityService.getClientMonthCalendar(
      agentId,
      Number(req.user.sub),
      year,
      month
    );
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Consulter son propre calendrier mensuel en tant qu’agent",
    description: "Permet à l'agent connecté de visualiser son calendrier complet du mois.",
  })
  @ApiParam({ name: "agentId", description: "ID de l'agent (doit correspondre à l'agent connecté)", example: 1 })
  @ApiQuery({ name: "year", description: "Année (ex: 2026)", example: 2026 })
  @ApiQuery({ name: "month", description: "Mois (1 à 12)", example: 9 })
  @ApiResponse({
    status: 200,
    description: "Calendrier mensuel de l'agent retourné avec succès.",
  })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({
    status: 403,
    description: "Rôle AGENT requis ou tentative de consulter le calendrier d'un autre agent.",
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("agent/:agentId/agent-calendar")
  async getAgentMonthCalendar(
    @Req() req,
    @Param("agentId", ParseIntPipe) agentId: number,
    @Query("year", ParseIntPipe) year: number,
    @Query("month", ParseIntPipe) month: number
  ) {
    if (Number(req.user.sub) !== agentId) {
      throw new ForbiddenException(
        "Vous ne pouvez consulter que votre propre calendrier"
      );
    }
    return this.availabilityService.getAgentMonthCalendar(agentId, year, month);
  }

  @ApiOperation({
    summary: "Consulter le calendrier mensuel public d’un agent",
    description: "Route publique indiquant les jours disponibles, complets ou indisponibles sur un mois.",
  })
  @ApiParam({ name: "agentId", description: "ID de l'agent", example: 1 })
  @ApiQuery({ name: "year", description: "Année (ex: 2026)", example: 2026 })
  @ApiQuery({ name: "month", description: "Mois (1 à 12)", example: 9 })
  @ApiResponse({
    status: 200,
    description: "Vue du mois publique retournée avec succès.",
  })
  @Get("agent/:agentId")
  async getMonthCalendar(
    @Param("agentId", ParseIntPipe) agentId: number,
    @Query("year", ParseIntPipe) year: number,
    @Query("month", ParseIntPipe) month: number
  ) {
    return this.availabilityService.getMonthCalendar(agentId, year, month);
  }
}