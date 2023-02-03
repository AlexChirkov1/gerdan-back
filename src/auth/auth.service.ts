import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { PasswordHelper } from 'src/utils/password.helper';

export type SessionTokens = {
    accessToken: string;
    refreshToken: string;
};

export type SessionTokenPayload = {
    sessionToken: string;
    userId: string,
    type: 'access' | 'refresh';
};

export const JWT_TYPES = Object.freeze({
    access: 'access',
    refresh: 'refresh'
});

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
    ) { }

    generateTokens(userId: ID): SessionTokens {
        const jwtKey = this.configService.get('JWT_KEY');
        const jwtLifetime = +this.configService.get('JWT_LIFETIME');
        const jwtRefreshLifetime = +this.configService.get('JWT_REFRESH_LIFETIME');
        const sessionToken = randomUUID();
        const accessToken = sign({ sessionToken, userId, type: JWT_TYPES.access }, jwtKey, { expiresIn: jwtLifetime });
        const refreshToken = sign({ sessionToken, userId, type: JWT_TYPES.refresh }, jwtKey, { expiresIn: jwtRefreshLifetime });
        return { accessToken, refreshToken };
    }

    verifyToken(token: string): JwtPayload & SessionTokenPayload {
        const jwtKey = this.configService.get('JWT_KEY');
        let data: any;
        try {
            data = verify(token, jwtKey);
        } catch (error) {
            throw new UnprocessableEntityException(error);
        }
        return data;
    }

    comparePasswords(providedPassword: string, password: string, salt: string): boolean {
        return PasswordHelper.compare(`${providedPassword}${salt}${process.env.SECRET_SALT}`, password);
    }
}
