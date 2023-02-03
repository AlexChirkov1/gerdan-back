import { Expose } from 'class-transformer';
import { ArrayType } from 'src/common/array_type.decorator';
import { PaginationDto } from 'src/common/pagination.dto';
import { GerdanDto } from './gerdan.dto';

export class GerdansDto extends PaginationDto {
    @Expose()
    @ArrayType(GerdanDto)
    data: GerdanDto[];
    constructor(data: any[], pagination: PaginationDto) {
        super(pagination);
        this.data = data;
    }
}
