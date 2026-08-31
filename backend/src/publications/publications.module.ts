import { Module } from "@nestjs/common";
import { PublicationsService } from "./publications.service";
import { PublicationsController } from "./publications.controller";
import { PublicationsRepository } from "./publications.repository";
import { UploadsModule } from "src/uploads/uploads.module";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [UploadsModule,MailModule],
  providers: [PublicationsService, PublicationsRepository],
  controllers: [PublicationsController],
})
export class PublicationsModule {}
