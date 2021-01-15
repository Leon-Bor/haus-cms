import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  let env = dotenv.config().parsed;
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(3000);
}

bootstrap();
