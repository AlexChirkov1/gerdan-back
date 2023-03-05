import { ApiProperty } from '@nestjs/swagger';

export class SchemaItem {
    @ApiProperty()
    x: number;
    @ApiProperty()
    y: number;
    @ApiProperty()
    filled: boolean;
    @ApiProperty({ required: false })
    color?: string;
    @ApiProperty({ required: false })
    number?: number;
}
