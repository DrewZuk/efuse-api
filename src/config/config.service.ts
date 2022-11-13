import { Inject, Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config/dist/config.service';
import * as joi from 'joi';

export interface Env {
  PORT: number;

  MONGO_HOST: string;
  MONGO_PORT: number;
  MONGO_USER: string;
  MONGO_PASSWORD: string;
}

export const validationSchema = joi.object({
  PORT: joi.number().default(3000),

  MONGO_HOST: joi.string().required(),
  MONGO_PORT: joi.number().default(27017),
  MONGO_USER: joi.string().required(),
  MONGO_PASSWORD: joi.string().required(),
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
}
