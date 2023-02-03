import { Expose } from 'class-transformer';

export class SessionDto {
    @Expose()
    accessToken: string;
    @Expose()
    refreshToken: string;
    constructor(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
