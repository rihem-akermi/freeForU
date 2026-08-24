import { Module } from "@nestjs/common";
import { ServicesService } from "./services.service";
import { ServicesController } from "./services.controller";
import { ServicesRepository } from "./services.repository";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [AuthModule],
  providers: [ServicesService, ServicesRepository],
  controllers: [ServicesController],
  exports: [ServicesRepository],
})
export class ServicesModule {}