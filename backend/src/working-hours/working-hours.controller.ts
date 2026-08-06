import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards, Req, ParseIntPipe } from "@nestjs/common";
import { WorkingHoursService } from "./working-hours.service";
import { WorkingHourDto } from "./dto/set-working-hours.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";

@Controller("working-hours")
export class WorkingHoursController {
  constructor(private workingHoursService: WorkingHoursService) {}

  // GET /working-hours/me?week_start=2026-08-02
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("me")
  async getMyWorkingHours(@Req() req, @Query("week_start") weekStart: string) {
    const ws = weekStart ?? new Date().toISOString().split("T")[0];
    return this.workingHoursService.getMyWorkingHours(req.user.sub, ws);
  }

  // PUT /working-hours/me — body : { week_start, day_of_week, is_working, start_time, end_time }
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Put("me")
  async setWorkingHour(@Req() req, @Body() body: WorkingHourDto) {
    return this.workingHoursService.setWorkingHour(req.user.sub, body);
  }

  // DELETE /working-hours/me/:dayOfWeek?week_start=2026-08-02
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Delete("me/:dayOfWeek")
  async removeWorkingDay(
    @Req() req,
    @Param("dayOfWeek", ParseIntPipe) dayOfWeek: number,
    @Query("week_start") weekStart: string,
  ) {
    const ws = weekStart ?? new Date().toISOString().split("T")[0];
    return this.workingHoursService.removeWorkingDay(req.user.sub, ws, dayOfWeek);
  }

  // Route publique — calendrier client
  @Get("agent/:agentId")
  async getAgentWorkingHours(
    @Param("agentId", ParseIntPipe) agentId: number,
    @Query("week_start") weekStart: string,
  ) {
    const ws = weekStart ?? new Date().toISOString().split("T")[0];
    return this.workingHoursService.getMyWorkingHours(agentId, ws);
  }
}
