import { Module } from '@nestjs/common';
import { GameEventController } from './game-event.controller';
import { GameEventService } from './game-event.service';

@Module({
  imports: [],
  controllers: [GameEventController],
  providers: [GameEventService],
})
export class GameEventModule {}
