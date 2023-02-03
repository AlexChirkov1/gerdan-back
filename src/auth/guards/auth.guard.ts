import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_KEY } from './auth.constant';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredAuthParams = this.reflector.getAllAndOverride(AUTH_KEY, [context.getHandler(), context.getClass()]);
        const { user } = context.switchToHttp().getRequest();

        if (!user) return false;
        if (!requiredAuthParams) return true;

        return false;
    }
}
