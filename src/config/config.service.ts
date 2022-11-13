import { Inject, Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config/dist/config.service';
import * as joi from 'joi';

export interface Env {
  PORT: number;
}

export const validationSchema = joi.object({
  PORT: joi.number().default(3000),
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
}
