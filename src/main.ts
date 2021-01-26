import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import * as express from 'express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  let env = dotenv.config().parsed;
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(express.static(join(__dirname, 'website', 'assets')));
  app.use(express.static(join(__dirname, 'services', 'template')));
  app.use(cookieParser());

  await app.listen(3000);
}

bootstrap();
