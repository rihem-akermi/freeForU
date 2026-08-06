import { Module } from "@nestjs/common";
import { WorkingHoursController } from "./working-hours.controller";
import { WorkingHoursService } from "./working-hours.service";
import { WorkingHoursRepository } from "./working-hours.repository";

@Module({
  exports:[WorkingHoursRepository],
  controllers: [WorkingHoursController],
  providers: [WorkingHoursService, WorkingHoursRepository],
})
export class WorkingHoursModule {}