export const FileTypes = {
    'jpg': 1
} as const;

export type FileTypes = keyof typeof FileTypes;

export function getFileType(type: number) {
    for (const key in FileTypes) {
        if (FileTypes[key] === type) return key;
    }
}
