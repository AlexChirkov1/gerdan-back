import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import { BadRequestException } from 'src/errors/handlers/bad_request_exception';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
    constructor(private schema: ObjectSchema) { }

    transform(value: any, metadata: ArgumentMetadata) {
        if (metadata.type !== 'query' && metadata.type !== 'body') return value;
        const { error } = this.schema.validate(value, { abortEarly: false, errors: { wrap: { label: false } } });
        if (error) throw new BadRequestException(error.details.map(detail => detail.message));
        return value;
    }
}
