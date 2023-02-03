import { ApiProperty } from '@nestjs/swagger';
import { BaseOutput } from 'src/common/base.output';

export class RegistrationOutput extends BaseOutput {
    @ApiProperty()
    username: string;
    @ApiProperty({ example: 'example@email.com' })
    email: string;
}
