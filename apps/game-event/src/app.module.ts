import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/game-event/.env',
      validationSchema: Joi.object({
        PORT: Joi.number().default(3002),
        MONGODB_URI: Joi.string().uri().required(),
        MONGODB_DB: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('3600s'),
        JWT_ISS: Joi.string().required(),
        JWT_AUD: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({
        uri: cs.get<string>('MONGODB_URI'),
        dbName: cs.get<string>('MONGODB_DB'),
      }),
      inject: [ConfigService],
    }),
    EventModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
