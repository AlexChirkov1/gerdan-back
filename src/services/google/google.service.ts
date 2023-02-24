import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginTicket, OAuth2Client } from 'google-auth-library';
import { BadRequestException } from 'src/errors/handlers/bad_request_exception';
import { ERROR_MESSAGES } from 'src/errors/messages';

export type UserInfo = {
    email: string;
    name: string;
    picture?: string;
};

@Injectable()
export class GoogleService {
    private readonly client: OAuth2Client;
    private readonly clientId: string;

    constructor(
        private readonly configService: ConfigService
    ) {
        this.clientId = <string>this.configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = <string>this.configService.get('GOOGLE_CLIENT_SECRET');

        this.client = new OAuth2Client(this.clientId, clientSecret);
    }

    async verifyToken(token: string): Promise<UserInfo> {
        let ticket: LoginTicket;

        try {
            ticket = await this.client.verifyIdToken({ idToken: token });
        } catch (error) {
            throw new BadRequestException(ERROR_MESSAGES.AUTH.invalid_token);
        }

        const payload = ticket.getPayload();

        return {
            email: payload.email,
            name: payload.name,
            picture: payload.picture
        };
    }
}
