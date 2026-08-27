import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
} from "@nestjs/common";

import { AgentsService } from "./agents.service";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { UpdatedAgentDto } from "./dto/update-agent.dto";

import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";

import { UseInterceptors, UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";

@ApiTags("Agents")
@Controller("agents")
export class AgentsController {
  constructor(private agentsService: AgentsService) {}

  @ApiOperation({
    summary: "Rechercher des agents par nom",
    description: "Route publique permettant de chercher des professionnels par leur nom.",
  })
  @ApiQuery({ name: "name", description: "Nom ou partie du nom de l'agent", example: "Karim" })
  @ApiResponse({ status: 200, description: "Résultats de recherche d'agents." })
  @Get("search")
  async searchAgents(@Query("name") name: string) {
    return this.agentsService.searchAgents(name);
  }

  

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Consulter mon profil agent (Agent connecté)",
    description: "Retourne les informations détaillées de l'agent authentifié.",
  })
  @ApiResponse({ status: 200, description: "Profil complet de l'agent." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("me")
  async getMyProfile(@Req() req) {
    const result = await this.agentsService.getAgentById(req.user.sub);
    return result;
  }

  @ApiOperation({
    summary: "Lister tous les agents",
    description: "Route publique listant tous les agents de la plateforme.",
  })
  @ApiResponse({ status: 200, description: "Liste de tous les agents." })
  @Get("all")
  async getAgents() {
    return this.agentsService.getAllAgents();
  }

  @ApiOperation({
    summary: "Lister les agents publics (filtrage par catégorie possible)",
    description: "Route publique pour la vitrine et l'espace client avec option de filtre.",
  })
  @ApiQuery({
    name: "category_id",
    required: false,
    description: "Filtrer par identifiant de catégorie",
    example: "1",
  })
  @ApiResponse({ status: 200, description: "Liste des agents publics." })
  @Get()
  async getPublicAgents(@Query("category_id") categoryId?: string) {
    return this.agentsService.getPublicAgents(
      categoryId ? Number(categoryId) : undefined
    );
  }

  @ApiOperation({
    summary: "Consulter le profil d'un agent par ID",
    description: "Route publique retournant les informations d'un agent spécifique.",
  })
  @ApiParam({ name: "id", description: "ID de l'agent", example: 1 })
  @ApiResponse({ status: 200, description: "Informations de l'agent." })
  @ApiResponse({ status: 404, description: "Agent introuvable." })
  @Get(":id")
  async getAgentById(@Param("id", ParseIntPipe) id: number) {
    return this.agentsService.getAgentById(id);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Créer un nouvel agent (Admin)",
    description: "Permet aux administrateurs d'ajouter un nouvel agent.",
  })
  @ApiResponse({ status: 201, description: "Agent créé avec succès." })
  @ApiResponse({ status: 400, description: "Données de création invalides." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle ADMIN requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post()
  async addAgent(@Body() body: CreateAgentDto) {
    return this.agentsService.addNewAgent(body);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Mettre à jour mon profil avec photo (Agent connecté)",
    description: "Permet à l'agent connecté de modifier ses informations et d'uploader sa photo.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string", example: "Karim Ben Salem" },
        email: { type: "string", example: "karim@example.com" },
        phone: { type: "string", example: "21698123456" },
        ville: { type: "string", example: "Tunis" },
        bio: { type: "string", example: "Électricien d'expérience" },
        zone: { type: "string", example: "Grand Tunis" },
        service_mode: { type: "string", enum: ["se_deplace", "recoit", "les_deux"] },
        photo: { type: "string", format: "binary" },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Profil de l'agent mis à jour." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Patch("me")
  @UseInterceptors(FileInterceptor("photo"))
  async updateMyProfile(
    @Req() req,
    @Body() body: UpdatedAgentDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return await this.agentsService.updateAgent(body, req.user.sub, file);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Modifier les informations d'un agent (Admin)",
    description: "Permet aux administrateurs de mettre à jour le profil d'un agent.",
  })
  @ApiParam({ name: "id", description: "ID de l'agent", example: 1 })
  @ApiResponse({ status: 200, description: "Agent mis à jour avec succès." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle ADMIN requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Patch(":id")
  async updateAgent(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdatedAgentDto
  ) {
    return this.agentsService.updateAgent(body, id);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Supprimer un agent (Admin)",
    description: "Supprime définitivement un agent de la plateforme.",
  })
  @ApiParam({ name: "id", description: "ID de l'agent", example: 1 })
  @ApiResponse({ status: 200, description: "Agent supprimé avec succès." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle ADMIN requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Delete(":id")
  async deleteAgent(@Param("id", ParseIntPipe) id: number) {
    return this.agentsService.deleteAgent(id);
  }
}
