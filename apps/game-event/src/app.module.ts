import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import * as Joi from 'joi';
import { GameEventModule } from './game-event/game-event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/game-event/.env',
      validationSchema: Joi.object({
        PORT: Joi.number().default(3002),
        MONGODB_URI: Joi.string().uri().required(),
        MONGODB_DB: Joi.string().required(),
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
    GameEventModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
