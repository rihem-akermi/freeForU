import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { reservationsRepository } from './reservations.repository';
import { AuthModule } from 'src/auth/auth.module';
import { ServicesModule } from 'src/services/services.module';


@Module({
  imports : [AuthModule ,ServicesModule],
  providers: [ReservationsService , reservationsRepository],
  controllers: [ReservationsController],
  exports:[reservationsRepository]
})
export class ReservationsModule {}
