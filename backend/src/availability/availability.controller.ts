import { Controller, Get, Param, Query, ParseIntPipe, Req, UseGuards, ForbiddenException } from "@nestjs/common";
import { AvailabilityService } from "./availability.service";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";

@Controller("availability")
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Get("agent/:agentId/day")
  async getDayAvailability(
    @Param("agentId", ParseIntPipe) agentId: number,
    @Query("date") date: string
  ) {
    return this.availabilityService.getDayAvailability(agentId, date);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("CLIENT")
  @Get("agent/:agentId/client-calendar")
  async getClientMonthCalendar(
    @Req() req,
    @Param("agentId", ParseIntPipe) agentId: number,
    @Query("year", ParseIntPipe) year: number,
    @Query("month", ParseIntPipe) month: number
  ) {
    return this.availabilityService.getClientMonthCalendar(agentId, Number(req.user.sub), year, month);
  }

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
      throw new ForbiddenException("Vous ne pouvez consulter que votre propre calendrier");
    }
    return this.availabilityService.getAgentMonthCalendar(agentId, year, month);
  }

  @Get("agent/:agentId")
  async getMonthCalendar(
    @Param("agentId", ParseIntPipe) agentId: number,
    @Query("year", ParseIntPipe) year: number,
    @Query("month", ParseIntPipe) month: number
  ) {
    return this.availabilityService.getMonthCalendar(agentId, year, month);
  }
}