import { ApiProperty } from '@nestjs/swagger';
import { BoardTypeEnum } from 'src/database/models/board.model';
import { ColormapItem } from './colormap_item';
import { SchemaItem } from './schema_item';

export class BoardSchemaInput {
    @ApiProperty({ enum: BoardTypeEnum, required: false })
    type: string;
    @ApiProperty({ required: false })
    backgroundColor?: string;
    @ApiProperty({ type: SchemaItem, isArray: true })
    schema: SchemaItem[];
    @ApiProperty({ type: ColormapItem, isArray: true })
    colormap: ColormapItem[];
}
