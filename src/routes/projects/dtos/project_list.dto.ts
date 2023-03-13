import { Expose } from 'class-transformer';
import { ArrayType } from 'src/common/array_type.decorator';
import { PaginationDto } from 'src/common/pagination.dto';
import { ProjectMetadataDto } from './project_metadata.dto';

export class ProjectListDto extends PaginationDto {
    @Expose()
    @ArrayType(ProjectMetadataDto)
    data: ProjectMetadataDto[];
    constructor(data: any[], pagination: PaginationDto) {
        super(pagination);
        this.data = data;
    }
}
