import { Inject, Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config/dist/config.service';
import * as joi from 'joi';

export interface Env {
  PORT: number;

  MONGO_HOST: string;
  MONGO_PORT: number;
  MONGO_USER: string;
  MONGO_PASSWORD: string;

  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  REDIS_TTL_MS: number;
}

export const validationSchema = joi.object({
  PORT: joi.number().default(3000),

  MONGO_HOST: joi.string().required(),
  MONGO_PORT: joi.number().default(27017),
  MONGO_USER: joi.string().required(),
  MONGO_PASSWORD: joi.string().required(),

  REDIS_HOST: joi.string(),
  REDIS_PORT: joi.number().default(6379),
  REDIS_PASSWORD: joi.string(),
  REDIS_TTL_MS: joi.number().default(5 * 60 * 1000), // default = 5 minutes
});

@Injectable()
export class ConfigService implements Env {
  constructor(
    @Inject(NestConfigService)
    private readonly configService: NestConfigService<Env>,
  ) {}

  get PORT(): number {
    return this.configService.get<number>('PORT');
  }

  get MONGO_HOST(): string {
    return this.configService.get<string>('MONGO_HOST');
  }

  get MONGO_PORT(): number {
    return this.configService.get<number>('MONGO_PORT');
  }

  get MONGO_USER(): string {
    return this.configService.get<string>('MONGO_USER');
  }

  get MONGO_PASSWORD(): string {
    return this.configService.get<string>('MONGO_PASSWORD');
  }

  buildMongoUri(): string {
    const host = this.MONGO_HOST;
    const port = this.MONGO_PORT;
    const user = this.MONGO_USER;
    const password = this.MONGO_PASSWORD;

    return `mongodb://${user}:${password}@${host}:${port}`;
  }

  get REDIS_HOST(): string {
    return this.configService.get<string>('REDIS_HOST');
  }

  get REDIS_PORT(): number {
    return this.configService.get<number>('REDIS_PORT');
  }

  get REDIS_PASSWORD(): string {
    return this.configService.get<string>('REDIS_PASSWORD');
  }

  get REDIS_TTL_MS(): number {
    return this.configService.get<number>('REDIS_TTL_MS');
  }
}
