import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { AuthService, JWT_TYPES } from './auth.service';
import { UserSessionData } from './decorators/userSession.decorator';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super();
    }

    async validate(token: string): Promise<UserSessionData> {
        if (!token) {
            throw new UnauthorizedException();
        }

        const tokenData = this.authService.verifyToken(token);
        if (tokenData.type !== JWT_TYPES.access) throw new UnauthorizedException();

        return {
            userId: tokenData.userId
        };
    }
}
