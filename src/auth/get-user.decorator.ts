import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext): String => {
    const req = ctx.switchToHttp().getRequest();
    return req.ok;
  },
);
