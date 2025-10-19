import { SwaggerModels } from '@app/swagger-models';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Team Review Platform API')
    .setDescription('Gateway / Auth / Game-Event docs')
    .addTag('Auth')
    .setVersion('1.0.0')
    .addServer('http://localhost:3001', 'Auth (Local)')
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

  await app.listen(process.env.port ?? 3000);
}

bootstrap();
