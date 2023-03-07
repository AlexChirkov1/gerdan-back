import { Expose } from 'class-transformer';
import { BaseDto } from 'src/common/base.dto';
import { Board } from 'src/database/models/board.model';

export class BoardMetadataDto extends BaseDto {
    @Expose()
    name: string;
    @Expose()
    type: string;
    @Expose()
    backgroundColor: string;

    constructor(board: Partial<Board>) {
        super(board);
        Object.assign(this, board);
    }
}
