import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { reservationsRepository } from './reservations.repository';

@Module({
  providers: [ReservationsService , reservationsRepository],
  controllers: [ReservationsController]
})
export class ReservationsModule {}
