import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { reservationsRepository } from './reservations.repository';
import { AuthModule } from 'src/auth/auth.module';
import { ServicesModule } from 'src/services/services.module';
import { MailModule } from 'src/mail/mail.module';


@Module({
  imports : [AuthModule ,ServicesModule,MailModule],
  providers: [ReservationsService , reservationsRepository],
  controllers: [ReservationsController],
  exports:[reservationsRepository]
})
export class ReservationsModule {}
