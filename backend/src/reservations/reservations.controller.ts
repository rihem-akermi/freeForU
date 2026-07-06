import { Controller, Delete, Get , Body,Post , Param , Patch } from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
    constructor(private reservationsService : ReservationsService) { }


    @Get()
    async getReservations() {
        console.log("getting infos ")
        const reservations = await this.reservationsService.getAllReservations();//table
        return reservations}

    @Post()
     async addReservation(@Body() body: { clientId: number; agentId: number; dateReservation: string }) {
    return await this.reservationsService.createReservation(body.clientId, body.agentId, body.dateReservation);
  }

   @Patch(':id')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return await this.reservationsService.updateStatus(Number(id), body.status);
  }

    @Delete(':id')
  async deleteReservation(@Param('id') id: string) {
    return await this.reservationsService.deleteReservation(Number(id));
  }
}
