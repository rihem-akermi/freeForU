import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor() {
      const redisUrl = process.env.REDIS_URL;

    this.client = redisUrl
    ? new Redis(redisUrl)
    : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      });

    this.client.on("connect", () => this.logger.log("Redis connecté ✅"));
    this.client.on("error", (err) =>
      this.logger.warn(`Erreur Redis : ${err.message}`)
    );
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      if (error instanceof Error) {
        //error is classified as unknown
        this.logger.warn(`Redis GET échoué pour ${key} : ${error.message}`);
      } else {
        this.logger.warn(`Redis GET échoué pour ${key} : ${String(error)}`);
      }
      return null; // MISS :request still not in cache
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, value, "EX", ttlSeconds); //expire après X secondes (ttl)
    } catch (error) {
      if (error instanceof Error) {
        this.logger.warn(`Redis SET échoué pour ${key} : ${error.message}`);
      } else {
        this.logger.warn(`Redis SET échoué pour ${key} : ${String(error)}`);
      }
    }
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
