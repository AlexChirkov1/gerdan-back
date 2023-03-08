import { Expose } from 'class-transformer';
import { BaseDto } from 'src/common/base.dto';
import { Project } from 'src/database/models/project.model';
// import { ColormapItem } from '../api/colormap_item';
// import { SchemaItem } from '../api/schema_item';

export class ProjectSchemaDto extends BaseDto {
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

    constructor(board: Partial<Project>) {
        super(board);
        Object.assign(this, board);
    }
}
