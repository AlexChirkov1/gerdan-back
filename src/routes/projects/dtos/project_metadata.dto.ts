import { Expose, Transform } from 'class-transformer';
import { BaseDto } from 'src/common/base.dto';
import { ObjectType } from 'src/common/object_type.decorator';
import { Project, ProjectTypeEnum } from 'src/database/models/project.model';
import { PreviewDto } from '../dtos/preview.dto';

export class ProjectMetadataDto extends BaseDto {
    @Expose()
    name: string;
    @Expose()
    @Transform(({ value }) => ProjectTypeEnum[value])
    type: string;
    @Expose()
    backgroundColor: string;
    @Expose()
    @ObjectType(PreviewDto)
    preview: PreviewDto;

    constructor(project: Partial<Project>) {
        super(project);
        Object.assign(this, project);
    }
}
