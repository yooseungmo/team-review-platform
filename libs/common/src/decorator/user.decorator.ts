import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Role, Team } from '..';

interface UserPayloadDto {
  sub: string;
  email?: string;
  role: Role;
  team: Team | null;
}

function parseFromGatewayHeaders(req: any): UserPayloadDto | null {
  const sub = req.headers['x-user-id'] as string | undefined;
  const role = req.headers['x-user-role'] as Role | undefined;
  const teamRaw = req.headers['x-user-team'] as string | undefined;
  const team = teamRaw && teamRaw !== 'null' && teamRaw !== 'undefined' ? (teamRaw as Team) : null;
  if (!sub || !role) return null;
  return { sub, role, team };
}

function parseFromBearer(req: any): UserPayloadDto | null {
  const authz: string | undefined = req.headers.authorization;
  if (!authz || !authz.startsWith('Bearer ')) return null;

  const token = authz.slice('Bearer '.length);

  const secret = process.env.JWT_SECRET;
  const iss = process.env.JWT_ISS ?? 'auth';
  const audAccept = (process.env.JWT_AUD_ACCEPT ?? process.env.JWT_AUD ?? 'gateway')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!secret) {
    throw new UnauthorizedException('JWT_SECRET is not configured');
  }

  try {
    const payload: any = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (payload.iss !== iss) throw new UnauthorizedException('Invalid token issuer');
    if (!audAccept.includes(payload.aud)) throw new UnauthorizedException('Invalid token audience');
    if (!payload.role) throw new UnauthorizedException('Missing role in token');

    return {
      sub: String(payload.sub),
      email: payload.email,
      role: payload.role as Role,
      team: payload.team ?? null,
    };
  } catch {
    throw new UnauthorizedException('Invalid or expired token');
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserPayloadDto => {
    const req = ctx.switchToHttp().getRequest();

    // 1) 게이트웨이가 넣어준 프록시 헤더 우선
    const fromProxy = parseFromGatewayHeaders(req);
    if (fromProxy) return fromProxy;

    // 2) Bearer 토큰 직접 검증 (3002 Swagger에서 직접 호출 시)
    const fromBearer = parseFromBearer(req);
    if (fromBearer) return fromBearer;

    // 3) 둘 다 없으면 401
    throw new UnauthorizedException('Missing credentials');
  },
);
