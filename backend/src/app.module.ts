import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config'; //.env



import { AgentsModule } from './agents/agents.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ReservationsModule } from './reservations/reservations.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
import { CategoriesModule } from './categories/categories.module';
import { PublicationsModule } from './publications/publications.module';
import { OffersModule } from './offers/offers.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UploadsModule } from './uploads/uploads.module';




@Module({
  imports: [
    DatabaseModule, UsersModule, AgentsModule, ReservationsModule, AuthModule ,
    ConfigModule.forRoot(),
    ContactsModule,
    CategoriesModule,
    PublicationsModule,
    OffersModule,
    PrismaModule,
    ReviewsModule,
    UploadsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
