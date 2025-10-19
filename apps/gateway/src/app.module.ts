import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import * as Joi from 'joi';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/gateway/.env',
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        AUTH_SERVICE_URL: Joi.string().required(),
        GAME_EVENT_SERVICE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    HttpModule,
    ProxyModule,
  ],
  // providers: [{ provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
