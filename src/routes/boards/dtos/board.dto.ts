import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'src/common/base.dto';

export class BoardMetadataDto extends BaseDto {
    @ApiProperty()
    name: string;
    @ApiProperty({ required: false })
    backgroundColor: string;
}
