import { JwtAuthGuard, RbacGuard } from '@app/common/guard';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';
import { GatewayRateLimitGuard } from './guard/rate-limit.guard';
import { AuthProxyController } from './proxy/auth-proxy.controller';
import { EventsProxyController } from './proxy/events-proxy.controller';
import { ProxyModule } from './proxy/proxy.module';
import { ProxyService } from './proxy/proxy.service';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/gateway/.env',
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        AUTH_BASE_URL: Joi.string().required(),
        EVENT_BASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_ISS: Joi.string().required(),
        JWT_AUD: Joi.string().required(),
        GATEWAY_TIMEOUT_MS: Joi.number().required(),
        GATEWAY_FORWARD_CLAIMS: Joi.boolean().required(),
        CORS_ORIGIN: Joi.string().required(),
        GATEWAY_RATE_LIMIT_TTL_SEC: Joi.number().default(60),
        GATEWAY_RATE_LIMIT_LIMIT: Joi.number().default(120),
        GATEWAY_CB_FAILURE_THRESHOLD: Joi.number().default(5),
        GATEWAY_CB_COOLDOWN_MS: Joi.number().default(10_000),
      }),
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        timeout: Number(cs.get('GATEWAY_TIMEOUT_MS') ?? 5000),
        maxRedirects: 5,
        validateStatus: () => true, // 다운스트림 상태 그대로 전달
      }),
    }),
    ProxyModule,
  ],
  controllers: [AuthProxyController, EventsProxyController],
  providers: [
    ProxyService,
    JwtStrategy, // 공용 전략 사용 (iss/aud 검증)
    { provide: APP_GUARD, useClass: GatewayRateLimitGuard }, // 0차 rate limit
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // 1차 인증
    { provide: APP_GUARD, useClass: RbacGuard }, // 엔드포인트 레벨 RBAC
  ],
})
export class AppModule {}
