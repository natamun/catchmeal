import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';
import { CorsIoAdapter } from './websocket/cors-io.adapter';

async function bootstrap() {
  if (!process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL is not defined');
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true });
  app.set('trust proxy', 1);
  app.use(cookieParser());
  app.useWebSocketAdapter(new CorsIoAdapter(app));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(
    new PrismaExceptionFilter(app.get(HttpAdapterHost).httpAdapter),
  );
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('CatCHMeal API')
      .setDescription('REST API for the CatCHMeal nutrition tracking app')
      .setVersion('1.0')
      .addCookieAuth('jwt')
      .build();
    SwaggerModule.setup(
      'api/docs',
      app,
      SwaggerModule.createDocument(app, config),
      {
        swaggerOptions: { defaultModelsExpandDepth: -1 },
      },
    );
  }
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
