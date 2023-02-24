import { ApiProperty } from '@nestjs/swagger';

export class LoginGoogleInput {
    @ApiProperty()
    token: string;
}
