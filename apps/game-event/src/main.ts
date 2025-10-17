import { NestFactory } from '@nestjs/core';
import { GameEventModule } from './game-event.module';

async function bootstrap() {
  const app = await NestFactory.create(GameEventModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
