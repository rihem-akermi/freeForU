import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { WorkingHoursService } from "./working-hours.service";
import { UpdateWorkingHoursDto } from "./dto/update-working-hours.dto";
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

@ApiTags("Working Hours")
@Controller("working-hours")
export class WorkingHoursController {
  constructor(private workingHoursService: WorkingHoursService) {}

  @ApiOperation({
    summary: "Consulter les horaires de travail d'un agent",
    description: "Route publique retournant la configuration des jours travaillés et horaires de l'agent.",
  })
  @ApiParam({ name: "agentId", description: "ID de l'agent", example: 1 })
  @ApiResponse({
    status: 200,
    description: "Horaires hebdomadaires de l'agent.",
  })
  @Get("agent/:agentId")
  async getByAgent(@Param("agentId", ParseIntPipe) agentId: number) {
    return this.workingHoursService.getByAgentId(agentId);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Consulter mes horaires de travail (Agent connecté)",
    description: "Retourne les horaires de travail de l'agent actuellement authentifié.",
  })
  @ApiResponse({
    status: 200,
    description: "Horaires hebdomadaires de l'agent connecté.",
  })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("me")
  async getMine(@Req() req) {
    return this.workingHoursService.getByAgentId(req.user.sub);
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Mettre à jour mes horaires de travail (Agent connecté)",
    description: "Met à jour la configuration des 7 jours de la semaine pour l'agent connecté.",
  })
  @ApiResponse({
    status: 200,
    description: "Horaires mis à jour avec succès.",
  })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Put("me")
  async updateMine(@Req() req, @Body() body: UpdateWorkingHoursDto) {
    return this.workingHoursService.updateMyWorkingHours(req.user.sub, body);
  }
}