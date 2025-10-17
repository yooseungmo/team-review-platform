import { Test, TestingModule } from '@nestjs/testing';
import { GameEventController } from './game-event.controller';
import { GameEventService } from './game-event.service';

describe('GameEventController', () => {
  let gameEventController: GameEventController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GameEventController],
      providers: [GameEventService],
    }).compile();

    gameEventController = app.get<GameEventController>(GameEventController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(gameEventController.getHello()).toBe('Hello World!');
    });
  });
});
