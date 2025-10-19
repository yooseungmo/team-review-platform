import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/auth/.env',
      validationSchema: Joi.object({
        PORT: Joi.number().default(3001),
        MONGODB_URI: Joi.string().uri().required(),
        MONGODB_DB: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('3600s'),
      }),
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        dbName: config.get<string>('MONGODB_DB'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
