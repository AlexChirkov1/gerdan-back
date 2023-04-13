import { Expose, Transform } from 'class-transformer';
import { BaseDto } from 'src/common/base.dto';
import { JSONType } from 'src/common/json_type.decorator';
import { Project, ProjectTypeEnum } from 'src/database/models/project.model';
import { ColormapItem, SchemaItem, AliasItem } from './input_types';

export class ProjectSchemaDto extends BaseDto {
    @Expose()
    name: string;
    @Expose()
    @Transform(({ value }) => ProjectTypeEnum[value])
    type: string;
    @Expose()
    backgroundColor: string;
    @Expose()
    @JSONType()
    schema: SchemaItem[][];
    @Expose()
    @JSONType()
    colormap: ColormapItem[];
    @Expose()
    @JSONType()
    alias: AliasItem[];

    constructor(project: Partial<Project>) {
        super(project);
        Object.assign(this, project);
    }
}
