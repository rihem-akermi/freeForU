import { Module } from "@nestjs/common";
import { AgentsService } from "./agents.service";
import { AgentsController } from "./agents.controller";
import { AgentsRepository } from "./agents.repository";
import { AuthModule } from "src/auth/auth.module";
import { UploadsModule } from "src/uploads/uploads.module";
import { RedisModule } from "src/redis/redis.module";

@Module({
  imports: [AuthModule, UploadsModule, RedisModule],
  providers: [AgentsService, AgentsRepository],
  controllers: [AgentsController],
  exports: [AgentsService],
})
export class AgentsModule {}
