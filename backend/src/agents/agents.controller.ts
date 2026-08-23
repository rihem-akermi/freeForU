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

@Controller("agents")
export class AgentsController {
  constructor(private agentsService: AgentsService) {}

  @Get("search")
  async searchAgents(@Query("name") name: string) {
    return this.agentsService.searchAgents(name);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("me")
  async getMyProfile(@Req() req) {
    const result = await this.agentsService.getAgentById(req.user.sub);
    return result;
  }

  @Get("all")
  async getAgents() {
    return this.agentsService.getAllAgents();
  }
  @Get()
  async getPublicAgents(@Query("category_id") categoryId?: string) {
    return this.agentsService.getPublicAgents(
      categoryId ? Number(categoryId) : undefined
    );
  }

  @Get(":id")
  async getAgentById(@Param("id", ParseIntPipe) id: number) {
    return this.agentsService.getAgentById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post()
  async addAgent(@Body() body: CreateAgentDto) {
    return this.agentsService.addNewAgent(body);
  }

  //NestJS lit les routes de haut en bas.

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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Patch(":id")
  async updateAgent(
    //si ça est le 1er si /me arrive (pas un nombre) -> 404 error et stope ici
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdatedAgentDto
  ) {
    return this.agentsService.updateAgent(body, id);
  }

  /*
  ✅ Toutes les routes statiques (/me, /all, /potato, /search, etc.) avant
  ✅ Les routes dynamiques (/:id) après
  */

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Delete(":id")
  async deleteAgent(@Param("id", ParseIntPipe) id: number) {
    return this.agentsService.deleteAgent(id);
  }
}
