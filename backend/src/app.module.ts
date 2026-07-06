import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AgentsModule } from './agents/agents.module';
import { ReservationsModule } from './reservations/reservations.module';

@Module({
  imports: [DatabaseModule, UsersModule, AgentsModule, ReservationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
