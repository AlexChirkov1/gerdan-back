import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PixelInput {
    @ApiProperty()
    x: number;
    @ApiProperty()
    y: number;
    @ApiProperty()
    color: string;
    @ApiPropertyOptional()
    index: number;
    @ApiPropertyOptional()
    indexColor: string;
    @ApiPropertyOptional()
    indexCoordX: number;
    @ApiPropertyOptional()
    indexCoordY: number;
}
