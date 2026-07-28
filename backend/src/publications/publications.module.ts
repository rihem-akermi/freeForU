import { Module } from "@nestjs/common";
import { PublicationsService } from "./publications.service";
import { PublicationsController } from "./publications.controller";
import { PublicationsRepository } from "./publications.repository";
import { UploadsModule } from "src/uploads/uploads.module";

@Module({
  imports: [UploadsModule],
  providers: [PublicationsService, PublicationsRepository],
  controllers: [PublicationsController],
})
export class PublicationsModule {}
