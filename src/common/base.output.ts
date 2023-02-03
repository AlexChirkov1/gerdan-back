import { ApiProperty } from '@nestjs/swagger';

export class BaseOutput {
    @ApiProperty({ example: 'MTIzNDU2Nzg' })
    id: string;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    updatedAt: Date;
}
