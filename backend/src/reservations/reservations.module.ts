import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { reservationsRepository } from './reservations.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports : [AuthModule],
  providers: [ReservationsService , reservationsRepository],
  controllers: [ReservationsController]
})
export class ReservationsModule {}
