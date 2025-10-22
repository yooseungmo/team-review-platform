import { UnifiedExceptionFilter } from '@app/common';
import { SwaggerModels } from '@app/swagger-models';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim()),
    credentials: true,
  });

  app.useGlobalFilters(new UnifiedExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('TRP Game-Event Service')
    .setDescription('Events CRUD + Reviews + Final Status + History')
    .addTag('Game-Event')
    .setVersion('1.0.0')
    .addServer('http://localhost:3002', 'Game-Event (Local)')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: SwaggerModels,
  });
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1, // 새로고침해도 토큰 유지
      persistAuthorization: true,
    },
  });

  const http = app.getHttpAdapter().getInstance();
  http.get('/healthz', (_req, res) => res.status(200).send('ok'));

  await app.listen(Number(process.env.PORT) || 3000, '0.0.0.0');
}
bootstrap();
