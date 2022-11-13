import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config/dist/config.module';
import { ConfigService, validationSchema } from './config.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      validationSchema,
      envFilePath: '.env',
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
