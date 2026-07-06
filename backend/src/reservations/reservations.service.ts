import { BadRequestException, Injectable } from '@nestjs/common';
import { reservationsRepository } from './reservations.repository';

@Injectable()
export class ReservationsService {
    constructor (private reservationsRepository : reservationsRepository){}

    async getAllReservations (){
        return await this.reservationsRepository.findAll() 
    }

    async createReservation(clientId: number, agentId: number, dateReservation: string){
        const newRes = await this.reservationsRepository.create(clientId,agentId,dateReservation)
        return newRes
    }

    async updateStatus(id: number, status: string) {
        const VALID_STATUSES = ['EN_ATTENTE', 'CONFIRMEE', 'ANNULEE'];
        if (!VALID_STATUSES.includes(status)) {
            throw new BadRequestException(`Status invalide : ${status}`);
            }
        const updatedStatus =  await this.reservationsRepository.updateStatus(id, status);
        return updatedStatus
    }

  async deleteReservation(id: number) {
    const deletedReservation =  await this.reservationsRepository.delete(id);
    return deletedReservation
}
}
 