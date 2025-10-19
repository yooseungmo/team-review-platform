import { Injectable } from '@nestjs/common';

@Injectable()
export class GameEventService {
  getHello(): string {
    return 'Hello World!';
  }
}
