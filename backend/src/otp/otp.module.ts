import { Module } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { OtpController } from "./otp.controller";
import { OtpRepository } from "./otp.repository";

@Module({
  providers: [OtpService, OtpRepository],
  controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule {}
