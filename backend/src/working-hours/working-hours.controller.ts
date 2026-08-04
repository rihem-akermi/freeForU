// working-hours.controller.ts
import { Controller, Get, Put, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from "@nestjs/common";
import { WorkingHoursService } from "./working-hours.service";
import { WorkingHourDto } from "./dto/set-working-hours.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";

@Controller("working-hours")
export class WorkingHoursController {
  constructor(private workingHoursService: WorkingHoursService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("me")
  async getMyWorkingHours(@Req() req) {
    return this.workingHoursService.getMyWorkingHours(req.user.sub);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Put("me")
  async setWorkingHour(@Req() req, @Body() body: WorkingHourDto) {
    return this.workingHoursService.setWorkingHour(req.user.sub, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Delete("me/:dayOfWeek")
  async removeWorkingDay(@Req() req, @Param("dayOfWeek", ParseIntPipe) dayOfWeek: number) {
    return this.workingHoursService.removeWorkingDay(req.user.sub, dayOfWeek);
  }

  // Route publique — un client doit pouvoir voir les horaires d'un agent (pour le calendrier)
  @Get("agent/:agentId")
  async getAgentWorkingHours(@Param("agentId", ParseIntPipe) agentId: number) {
    return this.workingHoursService.getMyWorkingHours(agentId);
  }
}