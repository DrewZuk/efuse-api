import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { ConfigService } from './config/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from './cache/cache.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    ConfigModule,
    CacheModule,
    HealthModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.buildMongoUri(),
        };
      },
    }),
    PostsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
