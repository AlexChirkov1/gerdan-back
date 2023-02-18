import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { UnauthorizedException } from 'src/errors/handlers/unauthorized_exception';
import { ERROR_MESSAGES } from 'src/errors/messages';
import { AuthService, JWT_TYPES } from './auth.service';
import { UserSessionData } from './decorators/userSession.decorator';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super();
    }

    async validate(token: string): Promise<UserSessionData> {
        if (!token) {
            throw new UnauthorizedException(ERROR_MESSAGES.AUTH.unauthorized);
        }

        const tokenData = this.authService.verifyToken(token);
        if (tokenData.type !== JWT_TYPES.access) throw new UnauthorizedException(ERROR_MESSAGES.AUTH.unauthorized);

        return {
            userId: tokenData.userId
        };
    }
}
