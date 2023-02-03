import { Expose } from 'class-transformer';
import { ArrayType } from 'src/common/array_type.decorator';
import { BaseDto } from 'src/common/base.dto';
import { ObjectType } from 'src/common/object_type.decorator';
import { Gerdan } from 'src/database/models/gerdan.model';
import { BaseUserDto } from 'src/routes/users/dtos/base-user.dto';
import { PixelDto } from './pixel.dto';
import { PreviewDto } from './preview.dto';

export class GerdanDto extends BaseDto {
    @Expose()
    name: string;
    @Expose()
    width: number;
    @Expose()
    height: number;
    @Expose()
    pixelSize: number;
    @Expose()
    backgroundColor: string;
    @Expose()
    @ArrayType(PixelDto)
    pixels: PixelDto[];
    @Expose()
    @ObjectType(BaseUserDto)
    author: BaseUserDto;
    @Expose()
    @ObjectType(PreviewDto)
    preview: PreviewDto;
    constructor(gerdan: Partial<Gerdan>) {
        super(gerdan);
        Object.assign(this, gerdan);
    }
}
