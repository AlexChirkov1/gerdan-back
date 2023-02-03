import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { base10 } from 'src/database/common/base10';

@Injectable()
export class FileIdPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (metadata.type !== 'param') return value;
        return base10(value.split('.')[0]);
    }
}
