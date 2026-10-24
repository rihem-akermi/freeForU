import { Global, Module } from "@nestjs/common";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";

import { JwtModule } from "@nestjs/jwt";

import { AuthGuard } from "./guards/auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { OtpModule } from "src/otp/otp.module";
import { MailModule } from "src/mail/mail.module";

@Global()
@Module({
  imports: [JwtModule.register({}), OtpModule, MailModule], //Create and configure an instance of JwtModule
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, AuthGuard, RolesGuard],
  exports: [AuthGuard, RolesGuard, JwtModule], // pour que des autres modules puissent les utiliser
})
export class AuthModule {}
