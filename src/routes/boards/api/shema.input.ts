import { ApiProperty } from '@nestjs/swagger';

class SchemaItem {
    @ApiProperty()
    x: number;
    @ApiProperty()
    y: number;
    @ApiProperty()
    filled: boolean;
    @ApiProperty({ required: false })
    colorFill?: string;
    @ApiProperty({ required: false })
    number?: number;
}

export class Schema {
    @ApiProperty({ type: SchemaItem, isArray: true })
    schema: SchemaItem[];
}
