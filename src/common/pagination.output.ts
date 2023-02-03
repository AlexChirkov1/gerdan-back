import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationOutput {
    @ApiPropertyOptional({ example: 'MTIzNDU2Nzg' })
    next?: string;
    @ApiPropertyOptional({ example: 'MTIzNDU2Nzg' })
    prev?: string;
    @ApiProperty({ example: 20 })
    count: number;
    @ApiProperty({ example: 1420 })
    totalCount: number;
}
