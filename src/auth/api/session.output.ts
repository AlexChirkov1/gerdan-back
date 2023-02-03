import { ApiProperty } from '@nestjs/swagger';

export class SessionOutput {
    @ApiProperty()
    accessToken: string;
    @ApiProperty()
    refreshToken: string;
}
