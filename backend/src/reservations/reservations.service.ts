import { BadRequestException, Injectable } from '@nestjs/common';
import { reservationsRepository } from './reservations.repository';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
    constructor (private reservationsRepository : reservationsRepository){}

    async getAllReservations (){
        return await this.reservationsRepository.findAll() 
    }

    async createReservation(clientCin: string, agentCin: string, dateReservation: string){
        const newRes = await this.reservationsRepository.create(clientCin, agentCin, dateReservation)
        return newRes
    }

    async updateReservation(id: number, part: UpdateReservationDto) {
        const VALID_STATUSES = ['EN_ATTENTE', 'CONFIRMEE', 'ANNULEE'];
        if (part.status && !VALID_STATUSES.includes(part.status)) {
            throw new BadRequestException(`Status invalide : ${part.status}`);
        }
        const updated =  await this.reservationsRepository.updateReservation(id, part);
        return updated
    }

  async deleteReservation(id: number) {
    const deletedReservation =  await this.reservationsRepository.delete(id);
    return deletedReservation
}
}
 