import { Module } from "@nestjs/common";

import { ConfigModule } from "@nestjs/config"; //.env

import { AgentsModule } from "./agents/agents.module";
import { AuthModule } from "./auth/auth.module";
import { ReservationsModule } from "./reservations/reservations.module";
import { UsersModule } from "./users/users.module";
import { ContactsModule } from "./contacts/contacts.module";
import { CategoriesModule } from "./categories/categories.module";
import { PublicationsModule } from "./publications/publications.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { UploadsModule } from "./uploads/uploads.module";
import { WorkingHoursModule } from "./working-hours/working-hours.module";
import { BlockedSlotsModule } from "./blocked-slots/blocked-slots.module";
import { AvailabilityModule } from "./availability/availability.module";
import { ServicesModule } from "./services/services.module";
import { ScheduleModule } from "@nestjs/schedule";
import { MailModule } from "./mail/mail.module";
import { OtpModule } from "./otp/otp.module";
import { RedisModule } from "./redis/redis.module";
import { AiModule } from "./ai/ai.module";

@Module({
  imports: [
    UsersModule,
    AgentsModule,
    ReservationsModule,
    AuthModule,
    ConfigModule.forRoot(), //charger les variables d’environnement depuis .env
    ContactsModule,
    CategoriesModule,
    PublicationsModule,
    PrismaModule,
    ReviewsModule,
    UploadsModule,
    WorkingHoursModule,
    BlockedSlotsModule,
    AvailabilityModule,
    ServicesModule,
    ScheduleModule.forRoot(), //planification des taches Cron
    MailModule,
    OtpModule,
    RedisModule,
    AiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
