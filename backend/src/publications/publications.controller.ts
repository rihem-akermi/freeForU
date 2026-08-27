// publications.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
} from "@nestjs/common";
import { PublicationsService } from "./publications.service";
import { CreatePublicationDto } from "./dto/create-publication.dto";
import { UpdatedPublicationDto } from "./dto/update-publication.dto";
import { UpdatePublicationStatusDto } from "./dto/update-publication-status.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";

import { FileInterceptor } from "@nestjs/platform-express";
import { UseInterceptors, UploadedFile } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";

@ApiTags("Publications")
@Controller("publications")
export class PublicationsController {
  constructor(private publicationsService: PublicationsService) {}

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Lister mes publications (Agent connecté)",
    description: "Retourne toutes les publications créées par l'agent authentifié.",
  })
  @ApiResponse({ status: 200, description: "Liste des publications de l'agent." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("me")
  async getMyPublications(@Req() req) {
    return this.publicationsService.getMyPublications(req.user.sub);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Lister mes publications en attente de modération (Agent connecté)",
    description: "Retourne les publications de l'agent ayant le statut `en_attente`.",
  })
  @ApiResponse({ status: 200, description: "Liste des publications en attente de l'agent." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("status/me")
  async getMyPendingPublications(@Req() req) {
    return this.publicationsService.getMyPendingPublications(req.user.sub);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Créer une publication avec photo (Agent connecté)",
    description: "Upload une image et crée une publication en attente de validation administrateur.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["titre", "description", "photo"],
      properties: {
        titre: { type: "string", example: "Rénovation salle de bain" },
        description: { type: "string", example: "Pose de carrelage et robinetterie moderne." },
        photo: { type: "string", format: "binary" },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Publication créée avec succès." })
  @ApiResponse({ status: 400, description: "Données ou fichier invalides." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Post()
  @UseInterceptors(FileInterceptor("photo"))
  async createPublication(
    @Req() req,
    @Body() body: CreatePublicationDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.publicationsService.createPublication(body, req.user.sub, file);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Lister toutes les publications en attente de modération (Admin)",
    description: "Retourne l'ensemble des publications de la plateforme nécessitant une validation.",
  })
  @ApiResponse({ status: 200, description: "Liste des publications en attente." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle ADMIN requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Get("admin")
  async getPendingPublications() {
    return this.publicationsService.getPendingPublications();
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Mettre à jour le statut d'une publication (Admin)",
    description: "Permet à un administrateur d'approuver ou rejeter une publication.",
  })
  @ApiParam({ name: "id", description: "ID de la publication", example: 1 })
  @ApiResponse({ status: 200, description: "Statut de la publication mis à jour." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle ADMIN requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Patch(":id/status")
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdatePublicationStatusDto
  ) {
    return this.publicationsService.updateStatus(id, body.status);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Modifier une de ses publications (Agent connecté)",
    description: "Permet à l'agent de modifier le titre, la description ou la photo de sa publication.",
  })
  @ApiParam({ name: "id", description: "ID de la publication", example: 1 })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        titre: { type: "string", example: "Nouveau titre" },
        description: { type: "string", example: "Nouvelle description" },
        photo: { type: "string", format: "binary" },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Publication mise à jour avec succès." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis ou publication non détenue." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Patch(":id")
  @UseInterceptors(FileInterceptor("photo"))
  async updateMyPublication(
    @Req() req,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdatedPublicationDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.publicationsService.updateMyPublication(
      body,
      id,
      req.user.sub,
      file
    );
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Supprimer une de ses publications (Agent connecté)",
    description: "Permet à l'agent de supprimer définitivement sa publication.",
  })
  @ApiParam({ name: "id", description: "ID de la publication", example: 1 })
  @ApiResponse({ status: 200, description: "Publication supprimée avec succès." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis ou publication non détenue." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Delete(":id")
  async deleteMyPublication(@Req() req, @Param("id", ParseIntPipe) id: number) {
    return this.publicationsService.deleteMyPublication(id, req.user.sub);
  }

  @ApiOperation({
    summary: "Consulter le portfolio public d'un agent",
    description: "Route publique listant toutes les publications approuvées de l'agent.",
  })
  @ApiParam({ name: "agentId", description: "ID de l'agent", example: 1 })
  @ApiResponse({ status: 200, description: "Portfolio de l'agent." })
  @Get("agent/:agentId")
  async getAgentPortfolio(@Param("agentId", ParseIntPipe) agentId: number) {
    return this.publicationsService.getAgentPortfolio(agentId);
  }
}
