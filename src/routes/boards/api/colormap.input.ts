import { ApiProperty } from '@nestjs/swagger';

class ColormapItem {
    @ApiProperty()
    color: string;
    @ApiProperty()
    number: number;
}

export class Colormap {
    @ApiProperty({ type: ColormapItem, isArray: true })
    schema: ColormapItem[];
}
