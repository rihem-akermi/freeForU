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

@Controller("services")
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  // Route publique : utilisée sur la page profil agent (client-facing)
  @Get("agent/:agentId")
  async getServicesByAgent(@Param("agentId", ParseIntPipe) agentId: number) {
    return this.servicesService.getServicesByAgent(agentId);
  }

  // Route statique déclarée AVANT ":id" pour éviter tout conflit de matching
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("me")
  async getMyServices(@Req() req) {
    return this.servicesService.getMyServices(req.user.sub);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Post()
  async createService(@Req() req, @Body() body: CreateServiceDto) {
    return this.servicesService.createService(req.user.sub, body);
  }

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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Delete(":id")
  async deleteService(@Req() req, @Param("id", ParseIntPipe) id: number) {
    return this.servicesService.deleteService(id, req.user.sub);
  }
}