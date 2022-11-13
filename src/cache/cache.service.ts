import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';

@Injectable()
export class CacheService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await new Promise<string | undefined>((resolve, reject) => {
      this.redis.get(key, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result);
      });
    });

    if (raw) {
      console.log('cache hit');
      return JSON.parse(raw);
    }

    console.log('cache miss');

    return null;
  }

  async set<T>(
    key: string,
    val: T,
    ttlMs: number = this.configService.REDIS_TTL_MS,
  ): Promise<void> {
    const raw = JSON.stringify(val);

    await new Promise<void>((resolve, reject) => {
      this.redis.psetex(key, ttlMs, raw, (err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }

  async delete(...keys: string[]): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.redis.del(keys, (err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }
}
