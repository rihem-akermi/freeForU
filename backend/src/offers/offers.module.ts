import { Module } from "@nestjs/common";
import { OffersService } from "./offers.service";
import { OffersController } from "./offers.controller";
import { OffersRepository } from "./offers.repository";
import { UploadsModule } from "src/uploads/uploads.module";

@Module({
  imports: [UploadsModule],
  providers: [OffersService, OffersRepository],
  controllers: [OffersController],
})
export class OffersModule {}
