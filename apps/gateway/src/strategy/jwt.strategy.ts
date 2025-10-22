import { Role, Team } from '@app/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: Role;
  team: Team | null; // PLANNER/REVIEWER 필수, ADMIN/VIEWER null 허용(도메인에서 엄격 검증)
  iss: string;
  aud: string;
  iat?: number;
  exp?: number;
}

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
    });

    this.iss = config.get('JWT_ISS', 'auth');
    const accept = config.get('JWT_AUD_ACCEPT') ?? config.get('JWT_AUD') ?? 'gateway';
    this.allowedAud = String(accept)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  validate(payload: JwtPayload) {
    if (payload.iss !== this.iss) throw new UnauthorizedException('Invalid token issuer');
    if (!this.allowedAud.includes(payload.aud))
      throw new UnauthorizedException('Invalid token audience');
    if (!payload.role) throw new UnauthorizedException('Missing role in token');
    // team의 상세 규칙(PLANNER/REVIEWER 필수, ADMIN/VIEWER null)은 도메인에서 최종 검증
    return payload;
  }
}
