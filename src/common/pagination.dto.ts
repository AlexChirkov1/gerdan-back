import { Expose } from 'class-transformer';
import { ToBase64 } from './base_transformers.decorator';
import { PaginationOutput } from './pagination.output';

export class PaginationDto implements PaginationOutput {
    @Expose()
    @ToBase64()
    next?: string;
    @Expose()
    @ToBase64()
    prev?: string;
    @Expose()
    count: number;
    @Expose()
    totalCount: number;
    constructor(pagination: PaginationDto) {
        Object.assign(this, pagination);
    }
}
