import {
  Controller,
  Delete,
  Get,
  Body,
  Post,
  Param,
  Patch,
  ParseIntPipe,
  Req,
  BadRequestException,
  Query,
} from "@nestjs/common";
import { ReservationsService } from "./reservations.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";

import { UseGuards } from "@nestjs/common";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { CreateMyReservationDto } from "./dto/create-my-reservation.dto";
import { UpdateAgentStatusDto } from "./dto/update-agent-status.dto";

@Controller("reservations")
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("agent/me")
  async getMyReservationsAsAgent(@Req() req) {
    return this.reservationsService.getMyReservationsAsAgent(req.user.sub);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("CLIENT")
  @Get("me")
  async getMyReservations(@Req() req) {
    return this.reservationsService.getMyReservations(req.user.sub);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Get("agent/me/day")
  async getMyDayReservations(@Req() req, @Query("date") date: string) {
    return this.reservationsService.getAgentDayReservations(req.user.sub, date);
  }

  @Get()
  async getReservations() {
    console.log("getting infos ");
    const reservations = await this.reservationsService.getAllReservations(); //table
    return reservations;
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post()
  async addReservation(@Body() body: CreateReservationDto) {
    return await this.reservationsService.createReservationByAdmin({
      clientId: body.clientId,
      agentId: body.agentId,
      dateReservation: body.dateReservation,
      heureReservation: body.heureReservation,
      heureFinReservation: body.heureFinReservation,
      customRequest: body.customRequest,
      serviceId: body.serviceId,
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("CLIENT")
  @Post("me")
  async createMyReservation(@Req() req, @Body() body: CreateMyReservationDto) {
    return await this.reservationsService.createMyReservation(
      body.agentId,
      body.dateReservation,
      body.heureReservation,
      body.heureFinReservation, // ← ajouté
      req.user.sub,
      body.customRequest,
      body.serviceId // ← ajouté
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT", "CLIENT")
  @Patch(":id/confirm-completion")
  async confirmCompletion(@Req() req, @Param("id", ParseIntPipe) id: number) {
    return this.reservationsService.confirmCompletion(
      id,
      req.user.sub,
      req.user.role
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Patch(":id/agent-status")
  async updateAgentStatus(
    @Req() req,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateAgentStatusDto
  ) {
    return this.reservationsService.updateAgentStatus(
      id,
      req.user.sub,
      body.status
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Patch(":id")
  async updateReservation(
    @Param("id") id: string,
    @Body() body: UpdateReservationDto
  ) {
    return await this.reservationsService.updateReservation(Number(id), body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Delete(":id")
  async deleteReservation(@Param("id") id: string) {
    return await this.reservationsService.deleteReservation(Number(id));
  }
}
