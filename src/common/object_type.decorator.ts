import { Transform } from 'class-transformer';

export function ObjectType(Dto: any): any {
    return Transform(({ value }) => value ? new Dto(value) : undefined);
}
