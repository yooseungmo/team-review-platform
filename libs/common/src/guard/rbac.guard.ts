import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RBAC_KEY, Role } from '..';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required =
      this.reflector.getAllAndOverride<Role[]>(RBAC_KEY, [ctx.getHandler(), ctx.getClass()]) ?? [];

    // 요구 롤 없으면 패스 (퍼블릭 아니어도 엔드포인트 레벨 RBAC 없음)
    if (required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const userRole: Role | undefined = req.user?.role;

    if (!userRole) {
      throw new ForbiddenException('권한 정보가 없습니다');
    }

    // ADMIN은 항상 허용 (과제/실무 관례)
    if (userRole === Role.ADMIN) return true;

    // 지정된 롤 중 하나면 통과
    if (required.includes(userRole)) return true;

    throw new ForbiddenException('접근 권한이 없습니다');
  }
}
