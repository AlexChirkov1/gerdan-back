import { ApiProperty } from '@nestjs/swagger';
import { BoardTypeEnum } from 'src/database/models/board.model';

export class BoardMetadataInput {
    @ApiProperty()
    name: string;
    @ApiProperty({ enum: BoardTypeEnum })
    type: string;
    @ApiProperty({ required: false })
    backgroundColor?: string;
}
