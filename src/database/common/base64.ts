export function base64(id: string | number): string {
    return Buffer.from(String(id), 'utf8').toString('base64url');
}
