import { Expose } from 'class-transformer';
import { BaseDto } from 'src/common/base.dto';
import { JSONType } from 'src/common/json_type.decorator';
import { Board } from 'src/database/models/board.model';
// import { ColormapItem } from '../api/colormap_item';
// import { SchemaItem } from '../api/schema_item';

export class BoardSchemaDto extends BaseDto {
    @Expose()
    name: string;
    @Expose()
    type: string;
    @Expose()
    backgroundColor: string;
    // TODO: fix
    // @Expose()
    // @JSONType()
    // schema: SchemaItem[];
    // @Expose()
    // @JSONType()
    // colormap: ColormapItem[];

    constructor(board: Partial<Board>) {
        super(board);
        Object.assign(this, board);
    }
}
