import { forwardRef, Module } from "@nestjs/common";
import { ServicesService } from "./services.service";
import { ServicesController } from "./services.controller";
import { ServicesRepository } from "./services.repository";
import { AuthModule } from "src/auth/auth.module";
import { AiModule } from "src/ai/ai.module";

@Module({
  imports: [AuthModule, forwardRef(() => AiModule)], //dependance circulaire
  providers: [ServicesService, ServicesRepository],
  controllers: [ServicesController],
  exports: [ServicesRepository, ServicesService],
})
export class ServicesModule {}
