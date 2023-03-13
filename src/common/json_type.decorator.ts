import { Transform } from 'class-transformer';

export function JSONType() {
    return Transform(({ value }) => value && JSON.parse(value));
}
