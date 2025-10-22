import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly allowedAud: string[];
  private readonly iss: string;

  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is not defined');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
      algorithms: ['HS256'],
      // aud/iss는 validate에서 커스텀 체크
    });

    this.iss = config.get('JWT_ISS', 'auth');

    const accept = config.get('JWT_AUD_ACCEPT') ?? config.get('JWT_AUD') ?? 'gateway';
    this.allowedAud = String(accept)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  validate(payload: any) {
    if (payload.iss !== this.iss) {
      throw new UnauthorizedException('Invalid token issuer');
    }
    if (!this.allowedAud.includes(payload.aud)) {
      throw new UnauthorizedException('Invalid token audience');
    }

    if (!payload.role) throw new UnauthorizedException('Missing role in token');
    if (payload.team === undefined) {
      // TODB 수정
    }

    return payload;
  }
}
