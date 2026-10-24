import { Module, forwardRef } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { AgentsModule } from "src/agents/agents.module";
import { RedisModule } from "src/redis/redis.module";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { ReservationsModule } from "src/reservations/reservations.module";
import { ServicesModule } from "src/services/services.module";

@Module({
  providers: [
    AiService,
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // applique à tout AiModule like AuthGuard/RolesGuard
  ],
  controllers: [AiController],
  exports: [AiService],
  imports: [
    AgentsModule,
    RedisModule,
    forwardRef(() => ReservationsModule), //AiModule → ReservationsModule → ServicesModule → AiModule
    forwardRef(() => ServicesModule), //dependance circulaire
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]), // 10 requêtes / minute / IP
  ],
})
export class AiModule {}
