import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = await app.resolve(ConfigService);

  app.useGlobalPipes(new ValidationPipe());

  const swaggerDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('eFuse API')
      .setDescription('A sample eFuse API for managing posts and comments.')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('docs', app, swaggerDoc);

  await app.listen(configService.PORT);
}
bootstrap();
