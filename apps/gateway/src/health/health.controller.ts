import { Public } from '@app/common';
import { Controller, Get } from '@nestjs/common';

@Public() // JWT 검사 스킵
@Controller()
export class HealthController {
  @Get('health')
  check() {
    return { status: 'ok' };
  }
}
