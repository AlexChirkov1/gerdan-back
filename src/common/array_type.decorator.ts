import { Transform } from 'class-transformer';

export function ArrayType(Dto: any): any {
    return Transform(({ value }) => value && value.length && value.map((element) => new Dto(element)));
}
