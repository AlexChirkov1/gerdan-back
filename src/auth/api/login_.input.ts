import { ApiProperty } from '@nestjs/swagger';

export class LoginInput {
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;
}
