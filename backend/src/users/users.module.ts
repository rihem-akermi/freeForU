import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";
import { AuthModule } from "src/auth/auth.module";
import { UploadsModule } from "src/uploads/uploads.module";

@Module({
  imports: [AuthModule, UploadsModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  //Sans ça, Nest ne sait pas que UsersRepository existe
})
export class UsersModule {}
