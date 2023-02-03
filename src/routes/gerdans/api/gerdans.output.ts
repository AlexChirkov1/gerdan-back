import { ApiProperty, OmitType } from '@nestjs/swagger';
import { PaginationOutput } from 'src/common/pagination.output';
import { GerdanOutput } from './gerdan.output';

export class GerdansOutput extends PaginationOutput {
    @ApiProperty({ type: () => OmitType(GerdanOutput, ['pixels']), isArray: true })
    data: GerdanOutput[];
}
