import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import config from './app/config';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './app/helper/globalErrorHandler';
import { UtilsInterceptor } from './app/utils/utils.interceptor';
import express from 'express';
dotenv.config();

const port = config.port;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug'],
  });
  app.use('/api/v1/webhook', express.raw({ type: 'application/json' }));

  app.enableCors({ origin: '*', credentials: true });
  app.setGlobalPrefix('api/v1', {
    exclude: ['/'],
  });
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalInterceptors(new UtilsInterceptor());
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost));
  await app.listen(port ?? 3000, () => {
    console.log(`server run on port http://localhost:${port}`);
  });
}
bootstrap().catch(console.error);
