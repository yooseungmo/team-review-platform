import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HealthController } from '../health/health.controller';
import { ProxyService } from './proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [HealthController],
  providers: [ProxyService],
})
export class ProxyModule {}
