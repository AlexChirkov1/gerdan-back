import { createHash, randomBytes } from 'crypto';

export class PasswordHelper {
    static generateSalt(): string {
        return randomBytes(16)
            .toString('hex');
    }
    static hash(password: string): string {
        return createHash('sha512')
            .update(password)
            .digest('hex');
    }
    static compare(password: string, hashedPassword: string): boolean {
        return createHash('sha512')
            .update(password)
            .digest('hex') === hashedPassword;
    }
}
