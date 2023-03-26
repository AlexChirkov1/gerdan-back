export function convertColorToMonochrome(hex: string, options = { primary: '#000000', secondary: '#FFFFFF' }): string {
    const r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? options.primary : options.secondary;
}
