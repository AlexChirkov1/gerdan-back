import { Expose } from 'class-transformer';
import { Model } from 'sequelize';
import { Pixel } from 'src/database/models/pixel.model';

export class PixelDto {
    @Expose()
    x: number;
    @Expose()
    y: number;
    @Expose()
    color: string;
    @Expose()
    index: number;
    @Expose()
    indexColor: string;
    @Expose()
    indexCoordX: number;
    @Expose()
    indexCoordY: number;
    constructor(pixel: Partial<Pixel>) {
        const model = pixel instanceof Model ? pixel.toJSON() : pixel;
        Object.assign(this, model);
    }
}
