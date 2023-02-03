import { ApiProperty } from '@nestjs/swagger';
import { PixelInput } from './pixel.input';

export class GerdanInput {
    @ApiProperty()
    name: string;
    @ApiProperty()
    width: number;
    @ApiProperty()
    height: number;
    @ApiProperty()
    pixelSize: number;
    @ApiProperty()
    backgroundColor: string;
    @ApiProperty({ type: () => PixelInput, isArray: true })
    pixels: PixelInput[];
}
