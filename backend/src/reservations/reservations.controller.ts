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
} from "@nestjs/common";
import { ReservationsService } from "./reservations.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";

import { UseGuards } from "@nestjs/common";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { CreateMyReservationDto } from "./dto/create-my-reservation.dto";

@Controller("reservations")
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("CLIENT")
  @Get("me")
  async getMyReservations(@Req() req) {
    return this.reservationsService.getMyReservations(req.user.sub);
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
      offerId: body.offerId,
      customRequest: body.customRequest,
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("CLIENT")
  @Post("me")
  async createMyReservation(@Req() req, @Body() body: CreateMyReservationDto) {
    return await this.reservationsService.createMyReservation(
      body.agentId,
      body.dateReservation,
      req.user.sub,
      body.offerId,
      body.customRequest
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
