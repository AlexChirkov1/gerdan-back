import { ApiProperty } from '@nestjs/swagger';

export class RegistrationInput {
    @ApiProperty()
    username: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;
}
