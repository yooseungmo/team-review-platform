import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role, Team } from '..';

// 게이트웨이 사용으로 변경
// export const CurrentUser = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext): UserPayloadDto => {
//     const request = ctx.switchToHttp().getRequest();
//     return request.user as UserPayloadDto;
//   },
// );

interface UserPayloadDto {
  sub: string;
  email?: string;
  role: Role;
  team: Team | null;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserPayloadDto | null => {
    const req = ctx.switchToHttp().getRequest();

    if (req.user?.sub) return req.user;

    const sub = req.headers['x-user-id'] as string | undefined;
    const role = req.headers['x-user-role'] as Role | undefined;
    const teamRaw = req.headers['x-user-team'] as string | undefined;
    const team =
      teamRaw && teamRaw !== 'null' && teamRaw !== 'undefined' ? (teamRaw as Team) : null;

    if (!sub || !role) return null;
    return { sub, role, team };
  },
);
