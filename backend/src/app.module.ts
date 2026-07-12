import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config'; //.env



import { AgentsModule } from './agents/agents.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ReservationsModule } from './reservations/reservations.module';
import { UsersModule } from './users/users.module';




@Module({
  imports: [
    DatabaseModule, UsersModule, AgentsModule, ReservationsModule, AuthModule ,
    ConfigModule.forRoot()//charge automatiquement le .env
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
