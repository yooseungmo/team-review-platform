import { IS_PUBLIC_KEY } from '@app/common';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  // Public 메타가 있으면 통과, 아니면 부모 로직(JWT 검증)
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: Error) {
    if (err) {
      // JWT 전략 내부 에러
      throw err;
    }
    if (info) {
      // 토큰 만료/형식 오류 등
      throw new UnauthorizedException(info.message);
    }
    if (!user) {
      // 토큰이 없거나 검증에 실패한 경우
      throw new UnauthorizedException('인증 토큰이 필요합니다');
    }
    return user;
  }
}
