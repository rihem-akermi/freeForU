import { Body, Controller, Get, Param, ParseIntPipe, Put, Req, UseGuards } from "@nestjs/common";
import { WorkingHoursService } from "./working-hours.service";
import { UpdateWorkingHoursDto } from "./dto/update-working-hours.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";

@Controller("working-hours")
export class WorkingHoursController {
  constructor(private workingHoursService: WorkingHoursService) {}

  @Get("agent/:agentId")
  async getByAgent(@Param("agentId", ParseIntPipe) agentId: number) {
    return this.workingHoursService.getByAgentId(agentId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("me")
  async getMine(@Req() req) {
    return this.workingHoursService.getByAgentId(req.user.sub);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Put("me")
  async updateMine(@Req() req, @Body() body: UpdateWorkingHoursDto) {
    return this.workingHoursService.updateMyWorkingHours(req.user.sub, body);
  }
}