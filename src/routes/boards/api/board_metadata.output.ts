import { ApiProperty } from '@nestjs/swagger';
import { BaseOutput } from 'src/common/base.output';
import { BoardTypeEnum } from 'src/database/models/board.model';

export class BoardMetadataOutput extends BaseOutput {
    @ApiProperty()
    name: string;
    @ApiProperty({ enum: BoardTypeEnum })
    type: string;
    @ApiProperty({ required: false })
    backgroundColor?: string;
}
