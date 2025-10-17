import { Controller, Get } from '@nestjs/common';
import { GameEventService } from './game-event.service';

@Controller()
export class GameEventController {
  constructor(private readonly gameEventService: GameEventService) {}

  @Get()
  getHello(): string {
    return this.gameEventService.getHello();
  }
}
