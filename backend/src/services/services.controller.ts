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
} from "@nestjs/swagger";

@ApiTags("services") // ← groupe toutes les routes de ce controller sous "services" dans l'UI
@Controller("services")
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  // Route publique : utilisée sur la page profil agent (client-facing)
  @ApiOperation({
    summary: "Lister les services d'un agent",
    description: "Route publique, accessible sans authentification.",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des services retournée avec succès.",
  })
  @ApiResponse({ status: 404, description: "Agent introuvable." })
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

  @ApiCookieAuth("accessToken") // ← indique que cette route nécessite le cookie
  @ApiOperation({ summary: "Créer un service (agent connecté)" })
  @ApiResponse({ status: 201, description: "Service créé." })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle insuffisant." })
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
