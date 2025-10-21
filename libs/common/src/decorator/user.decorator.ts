import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from '..';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): UserDto => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as UserDto;
});
