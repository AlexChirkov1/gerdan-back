import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseOutput } from 'src/common/base.output';

export class BaseUserOutput extends BaseOutput { 
    @ApiPropertyOptional()
    firstName: string;
    @ApiPropertyOptional()
    lastName: string;
    @ApiProperty()
    username: string;
    @ApiProperty({ example: 'example@email.com' })
    email: string;
}
