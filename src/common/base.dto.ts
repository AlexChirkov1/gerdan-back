import { Expose } from 'class-transformer';
import { Model } from 'sequelize';
import { BaseOutput } from './base.output';
import { ToBase64 } from './base_transformers.decorator';

export class BaseDto implements BaseOutput {
    @Expose()
    @ToBase64()
    id: string;
    @Expose()
    createdAt: Date;
    @Expose()
    updatedAt: Date;
    constructor(baseModel: Partial<Model>) {
        const model = baseModel instanceof Model ? baseModel.toJSON() : baseModel;
        Object.assign(this, model);
    }
}
