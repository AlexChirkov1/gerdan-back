import { Transform } from 'class-transformer';
export const ToBase10 = () => Transform(({ value }) => value && Buffer.from(value.toString(), 'base64url').toString('utf8'));
export const ToBase64 = () => Transform(({ value }) => value && Buffer.from(value.toString(), 'utf8').toString('base64url'));
