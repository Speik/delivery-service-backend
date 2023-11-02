import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Auth = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    return Boolean(authHeader);
  },
);
