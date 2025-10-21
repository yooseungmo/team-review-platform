import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RBAC_KEY } from '..';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required: string[] = this.reflector.get<string[]>(RBAC_KEY, ctx.getHandler()) ?? [];
    if (required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const userRole: string = req.user?.role;
    if (!userRole) {
      throw new ForbiddenException('권한 정보가 없습니다');
    }

    const allowed = new Set<string>();
    // required.flatMap((role) => RoleHierarchy[role]),
    // TODO: 추후 과제 롤에 맞게 fix

    const ok = required.includes(userRole);
    if (!ok) throw new ForbiddenException('접근 권한이 없습니다');
    return true;
  }
}
