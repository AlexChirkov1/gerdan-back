export function useDefault(obj: Record<string, any>, field: string, defaultValue: unknown) {
    if (!obj.hasOwnProperty(field)) obj[field] = defaultValue;
}
