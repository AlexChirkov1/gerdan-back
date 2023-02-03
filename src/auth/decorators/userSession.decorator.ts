import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserSessionData {
    userId: string;
}

export const UserSession = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): UserSessionData => ctx.switchToHttp().getRequest().user
);
