import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AppModule } from './app.module';
import { AuthGuard } from './guards/auth.guard';
import { FileStorage } from './shared';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  const configService = app.get(ConfigService);
  const fileStorage = app.get(FileStorage);

  await fileStorage.generatePaths();

  const authGuard = new AuthGuard(reflector, jwtService, configService);
  const appPort = configService.get<string>('APP_PORT')!;

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalGuards(authGuard);

  app.enableCors();
  app.setGlobalPrefix('api/v1');

  await app.listen(appPort);
};

bootstrap().catch(console.error);
