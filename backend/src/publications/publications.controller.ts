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

@Controller("publications")
export class PublicationsController {
  constructor(private publicationsService: PublicationsService) {}

  // Routes AGENT (statiques, avant les :id)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("me")
  async getMyPublications(@Req() req) {
    return this.publicationsService.getMyPublications(req.user.sub);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("status/me")
  async getMyPendingPublications(@Req() req) {
    return this.publicationsService.getMyPendingPublications(req.user.sub);
  }


  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Post()
  @UseInterceptors(FileInterceptor("photo")) //champs photo du formulaire
  async createPublication(
    @Req() req,
    @Body() body: CreatePublicationDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.publicationsService.createPublication(body, req.user.sub, file);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Get("admin")
  async getPendingPublications() {
    return this.publicationsService.getPendingPublications();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Patch(":id/status")
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdatePublicationStatusDto
  ) {
    return this.publicationsService.updateStatus(id, body.status);
  }

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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Delete(":id")
  async deleteMyPublication(@Req() req, @Param("id", ParseIntPipe) id: number) {
    return this.publicationsService.deleteMyPublication(id, req.user.sub);
  }

  @Get("agent/:agentId")
  async getAgentPortfolio(@Param("agentId", ParseIntPipe) agentId: number) {
    return this.publicationsService.getAgentPortfolio(agentId);
  }
}
