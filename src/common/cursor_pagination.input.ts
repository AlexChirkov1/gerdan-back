import { ApiProperty } from '@nestjs/swagger';

export class CursorPaginationInput {
    @ApiProperty({ required: false })
    id?: string;
    @ApiProperty()
    records: number;
}
