import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayloadDto } from '..';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayloadDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserPayloadDto;
  },
);
