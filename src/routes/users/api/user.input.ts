import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserInput {
    @ApiPropertyOptional()
    firstName: string;
    @ApiPropertyOptional()
    lastName: string;
    @ApiPropertyOptional()
    username: string;
    @ApiPropertyOptional({ example: 'example@email.com' })
    email: string;
    @ApiPropertyOptional()
    password: string;
}
