export type PixelInput = {
    x: number;
    y: number;
    color: string;
    index: number;
    indexColor: string;
    indexCoordX: number;
    indexCoordY: number;
};

export type GerdanInput = {
    name: string;
    width: number;
    height: number;
    pixelSize: number;
    backgroundColor: string;
    pixels: PixelInput[];
};

export type PDFOptionsInput = {
    numbers: boolean;
}

