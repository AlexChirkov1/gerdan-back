import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDto } from 'src/common/base.dto';
import { BaseUserOutput } from 'src/routes/users/api/base-user.output';
import { PixelOutput } from './pixel.output';

export class GerdanOutput extends BaseDto {
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
    @ApiPropertyOptional({ type: () => PixelOutput, isArray: true })
    pixels: PixelOutput[];
    @ApiProperty({ type: () => BaseUserOutput })
    author: BaseUserOutput;
}
