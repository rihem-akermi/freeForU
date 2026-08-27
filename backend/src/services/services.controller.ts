import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ServicesService } from "./services.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
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

@ApiTags("Services")
@Controller("services")
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @ApiOperation({
    summary: "Lister les services d'un agent",
    description: "Route publique, accessible sans authentification.",
  })
  @ApiParam({ name: "agentId", description: "ID de l'agent", example: 1 })
  @ApiResponse({
    status: 200,
    description: "Liste des services retournée avec succès.",
  })
  @ApiResponse({ status: 404, description: "Agent introuvable." })
  @Get("agent/:agentId")
  async getServicesByAgent(@Param("agentId", ParseIntPipe) agentId: number) {
    return this.servicesService.getServicesByAgent(agentId);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Lister les services de l'agent connecté",
    description: "Retourne tous les services créés par l'agent authentifié.",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des services de l'agent.",
  })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("me")
  async getMyServices(@Req() req) {
    return this.servicesService.getMyServices(req.user.sub);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Créer un nouveau service (Agent connecté)",
    description: "Permet à l'agent connecté d'ajouter un service à son catalogue.",
  })
  @ApiResponse({ status: 201, description: "Service créé avec succès." })
  @ApiResponse({ status: 400, description: "Données de service invalides." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Post()
  async createService(@Req() req, @Body() body: CreateServiceDto) {
    return this.servicesService.createService(req.user.sub, body);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Modifier un service existant (Agent connecté)",
    description: "Permet à l'agent de modifier l'un de ses propres services.",
  })
  @ApiParam({ name: "id", description: "ID du service", example: 1 })
  @ApiResponse({ status: 200, description: "Service mis à jour avec succès." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis ou service non détenu par l'agent." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Patch(":id")
  async updateService(
    @Req() req,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateServiceDto
  ) {
    return this.servicesService.updateService(id, req.user.sub, body);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Supprimer un service (Agent connecté)",
    description: "Permet à l'agent de supprimer l'un de ses services.",
  })
  @ApiParam({ name: "id", description: "ID du service", example: 1 })
  @ApiResponse({ status: 200, description: "Service supprimé avec succès." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis ou service non détenu par l'agent." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Delete(":id")
  async deleteService(@Req() req, @Param("id", ParseIntPipe) id: number) {
    return this.servicesService.deleteService(id, req.user.sub);
  }
}
