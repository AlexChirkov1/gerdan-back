import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserInput {
    @ApiPropertyOptional()
    username: string;
    @ApiPropertyOptional({ example: 'example@email.com' })
    email: string;
    @ApiPropertyOptional()
    password: string;
}
