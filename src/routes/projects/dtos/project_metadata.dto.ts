import { Expose, Transform } from 'class-transformer';
import { BaseDto } from 'src/common/base.dto';
import { Project, ProjectTypeEnum } from 'src/database/models/project.model';

export class ProjectMetadataDto extends BaseDto {
    @Expose()
    name: string;
    @Expose()
    @Transform(({ value }) => ProjectTypeEnum[value])
    type: string;
    @Expose()
    backgroundColor: string;

    constructor(project: Partial<Project>) {
        super(project);
        Object.assign(this, project);
    }
}
