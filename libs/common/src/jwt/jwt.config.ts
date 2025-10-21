import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';

export class JwtConfig {
  readonly access: JwtSignOptions;
  readonly refresh: JwtSignOptions;

  constructor(configService: ConfigService) {
    this.access = {
      secret: this.getRequired(configService, 'JWT_SECRET'),
      expiresIn: this.getRequired(configService, 'JWT_EXPIRES_IN'),
      issuer: configService.get('JWT_ISS', 'auth'),
      audience: configService.get('JWT_AUD', 'gateway'),
      algorithm: 'HS256',
    };

    this.refresh = {
      secret: this.getRequired(configService, 'REFRESH_TOKEN_SECRET'),
      expiresIn: this.getRequired(configService, 'REFRESH_TOKEN_EXPIRES_IN'),
      algorithm: 'HS256',
    };
  }

  private getRequired(config: ConfigService, key: string): string {
    const value = config.get<string>(key);
    if (!value) {
      throw new InternalServerErrorException(`Missing required config: ${key}`);
    }
    return value;
  }
}
