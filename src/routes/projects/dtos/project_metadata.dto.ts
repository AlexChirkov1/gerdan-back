import { Expose } from 'class-transformer';
import { BaseDto } from 'src/common/base.dto';
import { Project } from 'src/database/models/project.model';

export class ProjectMetadataDto extends BaseDto {
    @Expose()
    name: string;
    @Expose()
    type: string;
    @Expose()
    backgroundColor: string;

    constructor(board: Partial<Project>) {
        super(board);
        Object.assign(this, board);
    }
}
