import { ApiProperty } from '@nestjs/swagger';

export class ColormapItem {
    @ApiProperty()
    color: string;
    @ApiProperty()
    number: number;
}
