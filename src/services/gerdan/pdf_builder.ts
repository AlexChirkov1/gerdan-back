import { createWriteStream } from 'fs';
import * as PDFDocument from 'pdfkit';
import { BLACK } from './colors';
import { PixelsGrid, Statistics } from './gerdan';

type MetaData = {
    Title: string;
    Author: string;
    pixelSize: number;
    indexSize: number;
    height: number;
    width: number;
    backgroundColor: string;
};

export class PDFBuilder {
    private readonly charactersSet = [
        'Ø', '1', '2', '3', '4',
        '5', '6', '7', '8', '9',
        'A', 'B', 'C', 'D', 'E',
        'F', 'G', 'H', 'J', 'K',
        'L', 'M', 'N', 'O', 'P',
        'R', 'S', 'T', 'U', 'V',
        'W', 'X', 'Y', 'Z'] as const;
    static readonly docSize = {
        width: 595.28,
        height: 841.89,
        marginLeft: 60,
        marginTop: 58,
        marginRight: 55.28,
        marginBottom: 57.98
    } as const;
    static readonly printSize = {
        width: this.docSize.width - this.docSize.marginLeft - this.docSize.marginRight,
        height: this.docSize.height - this.docSize.marginTop - this.docSize.marginBottom,
    } as const;
    private readonly metadata: MetaData;
    private doc: typeof PDFDocument;
    constructor(path: string, metadata: MetaData) {
        this.metadata = metadata;
        this.doc = new PDFDocument({
            size: 'A4',
            autoFirstPage: false,
            margin: 0,
            layout: 'portrait',
            info: {
                Title: this.metadata.Title,
                Author: this.metadata.Author
            },
            pdfVersion: '1.7'
        });

        this.doc.pipe(createWriteStream(path));
    }

    public addInfoPage(userName: string, gerdanName: string) {
        this.doc
            .addPage()
            .fontSize(60)
            .text(gerdanName, PDFBuilder.docSize.marginRight, 200)
            .fontSize(42)
            .text(`by @${userName}`)
            .text('generated on Gerdan.js');

        this.addSiteMark();
    }

    public closeDocument() {
        this.doc.end();
    }

    public drawStatistics(statistics: Statistics) {
        const textPositionX = PDFBuilder.docSize.width - PDFBuilder.docSize.marginLeft - 100;
        let textPositionY = 400;
        const textSize = 14;
        const space = 18;
        this.doc
            .fontSize(textSize);
        textPositionY += space;
        this.doc.text(`Rows: ${statistics.rows}`, textPositionX, textPositionY);
        textPositionY += space;
        this.doc.text(`Columns: ${statistics.columns}`, textPositionX, textPositionY);

        for (const [key, value] of Object.entries(statistics.colors)) {
            textPositionY += space;
            this.doc.text(`${this.charactersSet[key]} - ${value.color} - ${value.count}`, textPositionX, textPositionY);
            this.drawPixel(
                textPositionX - this.metadata.pixelSize,
                textPositionY - (space - textSize) / 2,
                value.color,
                textSize
            );
        }
    }

    public drawPixelsGrid(pixelsGrid: PixelsGrid) {
        const pixelsPerPage = ~~(PDFBuilder.printSize.height / this.metadata.pixelSize);
        const totalPages = Math.floor(this.metadata.height / pixelsPerPage);
        let page = -1;
        for (let y = 0; y < this.metadata.height; y++) {
            if (!(y % pixelsPerPage)) {
                page++;
                this.doc
                    .addPage()
                    .fontSize(this.metadata.indexSize);
                this.addPageNumber(page, totalPages);
                this.addSiteMark();
            }
            for (let x = 0; x < this.metadata.width; x++) {
                const color = pixelsGrid[y][x].color;
                this.drawPixel(
                    this.pixelPositionX(x),
                    this.pixelPositionY(y - pixelsPerPage * page),
                    color
                );
                if (color !== this.metadata.backgroundColor)
                    this.writeIndex(
                        this.indexPosition(this.pixelPositionX(x)),
                        this.indexPosition(this.pixelPositionY(y - pixelsPerPage * page)),
                        pixelsGrid[y][x].index,
                        pixelsGrid[y][x].indexColor
                    );
            }
        }
    }

    private writeIndex(x: number, y: number, index: number, color: string) {
        if (!index) return;
        this.doc
            .fillColor(color ?? BLACK)
            .text(
                this.charactersSet[index],
                this.indexPosition(x),
                this.indexPosition(y),
                {
                    lineBreak: false,
                });
    }

    private indexPosition(pos: number): number {
        return pos + this.metadata.pixelSize / 7;
    }

    private pixelPositionX(x: number): number {
        return x * this.metadata.pixelSize + PDFBuilder.docSize.marginLeft;
    }

    private pixelPositionY(y: number): number {
        return y * this.metadata.pixelSize + PDFBuilder.docSize.marginTop;
    }

    private addPageNumber(currentPage: number, totalPages: number) {
        this.doc
            .fontSize(14)
            .fillColor(BLACK)
            .text(`${currentPage + 1} / ${totalPages + 1}`,
                500,
                800
            );
    }

    private drawPixel(x: number, y: number, color: string, size = this.metadata.pixelSize) {
        this.doc
            .rect(x, y, size, size)
            .fillAndStroke(color, BLACK);
    }

    private addSiteMark() {
        const siteMark = process.env.SITE_MARK as string;
        const markWidth = this.doc
            .fontSize(14)
            .widthOfString(siteMark);

        this.doc
            .fontSize(14)
            .fillColor(BLACK)
            .text('Gerdan.js',
                PDFBuilder.docSize.width / 2 - markWidth / 2,
                800
            );
    }
}
