import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { AgentsModule } from "src/agents/agents.module";
import { RedisModule } from "src/redis/redis.module";

@Module({
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
  imports:[AgentsModule,RedisModule]
})
export class AiModule {}
