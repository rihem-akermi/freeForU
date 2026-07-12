import { Controller, Delete, Get , Body,Post , Param , Patch } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';



@Controller('reservations')
export class ReservationsController {
    constructor(private reservationsService : ReservationsService) { }


    @Get()
    async getReservations() {
        console.log("getting infos ")
        const reservations = await this.reservationsService.getAllReservations();//table
        return reservations}

    @Post()
    @UseGuards(AuthGuard,RolesGuard)
    @Roles("ADMIN")
    async addReservation(@Body() body: CreateReservationDto) {
      return await this.reservationsService.createReservation(body.clientCin, body.agentCin, body.dateReservation);
    }

   @Patch(':id')
   @UseGuards(AuthGuard,RolesGuard)
     @Roles("ADMIN")
    async updateReservation(@Param('id') id: string, @Body() body: UpdateReservationDto) {
      return await this.reservationsService.updateReservation(Number(id), body);
    }

    @Delete(':id')
    @UseGuards(AuthGuard,RolesGuard)
      @Roles("ADMIN")
  async deleteReservation(@Param('id') id: string) {
    return await this.reservationsService.deleteReservation(Number(id));
  }
}
