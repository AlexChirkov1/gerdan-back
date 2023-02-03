export function base10(id: string | number): number {
    return +Buffer.from(String(id), 'base64url').toString('utf8');
}
