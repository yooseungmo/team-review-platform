import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './event.controller';
import { EventMongoRepository } from './event.mongo.repository';
import { EventService } from './event.service';
import { GameEvent, GameEventSchema } from './schemas/event.schema';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GameEvent.name, schema: GameEventSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [EventController],
  providers: [EventService, EventMongoRepository, JwtStrategy],
})
export class EventModule {}
