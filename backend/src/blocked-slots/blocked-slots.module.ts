import { Module } from "@nestjs/common";
import { BlockedSlotsController } from "./blocked-slots.controller";
import { BlockedSlotsService } from "./blocked-slots.service";
import { BlockedSlotsRepository } from "./blocked-slots.repository";

@Module({
  controllers: [BlockedSlotsController],
  providers: [BlockedSlotsService, BlockedSlotsRepository],
})
export class BlockedSlotsModule {}