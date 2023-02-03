import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AppGuard } from './app.guard';
import { AUTH_KEY } from './auth.constant';
import { AuthGuard } from './auth.guard';

export function Auth(authParams?: any) {
    return applyDecorators(
        SetMetadata(AUTH_KEY, authParams),
        UseGuards(AppGuard, AuthGuard),
        ApiBearerAuth()
    );
}
