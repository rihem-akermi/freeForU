import { Module } from "@nestjs/common";
import { AvailabilityController } from "./availability.controller";
import { AvailabilityService } from "./availability.service";
import { WorkingHoursModule } from "src/working-hours/working-hours.module";
import { BlockedSlotsModule } from "src/blocked-slots/blocked-slots.module";
import { ReservationsModule } from "src/reservations/reservations.module";
import { AuthModule } from "src/auth/auth.module"; // ← nécessaire pour les guards

@Module({
  imports: [
    WorkingHoursModule,
    BlockedSlotsModule,
    ReservationsModule,
    AuthModule,
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
