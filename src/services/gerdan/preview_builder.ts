import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import { PixelsGrid } from './gerdan';

export class PreviewBuilder {
    private readonly canvas: Canvas;
    private readonly ctx: CanvasRenderingContext2D;
    constructor(private readonly width: number, private readonly height: number, private readonly pixelSize = 20) {
        this.canvas = createCanvas(this.width * this.pixelSize, this.height * this.pixelSize);
        this.ctx = this.canvas.getContext('2d');
    }

    public drawPixelsGrid(pixelsGrid: PixelsGrid) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const color = pixelsGrid[y][x].color;
                this.drawPixel(this.pixelPosition(x), this.pixelPosition(y), color);
            }
        }
    }

    public getPreviewBuffer(): Buffer {
        return this.canvas.toBuffer('image/jpeg', { quality: 1, progressive: true, chromaSubsampling: false });
    }

    private drawPixel(x: number, y: number, color: string, size = this.pixelSize) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, size, size);
    }

    private pixelPosition(pos: number): number {
        return pos * this.pixelSize;
    }
}
