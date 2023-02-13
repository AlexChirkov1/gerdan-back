import { createWriteStream } from 'fs';
import * as PDFDocument from 'pdfkit';
import { FontLoader } from 'src/utils/font_loader';
import { BLACK } from './colors';
import { PixelsGrid, Statistics } from './gerdan';

type MetaData = {
    Title: string;
    Author: string;
    pixelSize: number;
    height: number;
    width: number;
    backgroundColor: string;
};

export class PDFBuilder {
    private readonly FONT_SIZE = 14;
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
    private indexSize = 0;
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
            pdfVersion: '1.7',
        });

        this.doc.registerFont('Roboto-Regular', FontLoader.getRobotoRegular());
        this.doc.registerFont('Roboto-Medium', FontLoader.getRobotoMedium());
        this.doc.font('Roboto-Regular');

        this.doc.pipe(createWriteStream(path));
    }

    public addInfoPage(userName: string, gerdanName: string) {
        const TITLE_FONT = 24;
        const SUBTITLE_FONT = 16;
        const fromSite = `generated on ${process.env.SITE_MARK}`;
        const siteURL = process.env.SITE_URL;
        const byUser = `by @${userName}`;

        this.doc
            .addPage()
            .font('Roboto-Medium')
            .fontSize(TITLE_FONT)
            .text(gerdanName, this.centeredPositionOfText(gerdanName, TITLE_FONT), 100)
            .font('Roboto-Regular')
            .fontSize(SUBTITLE_FONT)
            .moveDown()
            .text(byUser, this.centeredPositionOfText(byUser, SUBTITLE_FONT))
            .moveDown()
            .moveDown()
            .text(fromSite, this.centeredPositionOfText(fromSite, SUBTITLE_FONT))
            .text(siteURL, this.centeredPositionOfText(siteURL, SUBTITLE_FONT), null, { link: process.env.SITE_URL, underline: true, oblique: true });

        this.addSiteMark();
    }

    public closeDocument() {
        this.doc.end();
    }

    public drawStatistics(statistics: Statistics) {
        this.doc.fontSize(this.FONT_SIZE);
        this.doc.text(`Сolumns (стовпців): ${statistics.columns}. Rows (рядків): ${statistics.rows}.`, PDFBuilder.docSize.marginLeft, 300);


        const space = 18;
        const maxRows = 15;
        const maxColumns = 3;
        const textPositionX = PDFBuilder.docSize.marginLeft;
        let textPositionY = 300;

        textPositionY += space;
        textPositionY += space;
        for (const [key, value] of Object.entries(statistics.colors)) {
            textPositionY += space;
            this.doc
                .fillColor(BLACK)
                .text(`${[key]} - ${value.color}  (${value.count})`, textPositionX, textPositionY);
            this.drawPixel(
                textPositionX - this.metadata.pixelSize,
                textPositionY - (space - this.FONT_SIZE) / 2,
                value.color,
                this.FONT_SIZE
            );
        }
    }

    public drawPixelsGrid(pixelsGrid: PixelsGrid) {
        const fontSize = this.setFontSize();
        const pixelsPerPage = ~~(PDFBuilder.printSize.height / this.metadata.pixelSize);
        const totalPages = ~~(this.metadata.height / pixelsPerPage);
        let page = -1;
        for (let y = 0; y < this.metadata.height; y++) {
            if (!(y % pixelsPerPage)) {
                page++;
                this.doc.addPage().fontSize(fontSize);
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
                if (color !== this.metadata.backgroundColor) {
                    const [indexX, indexY] = this.centeredPositionOfIndex(
                        pixelsGrid[y][x].index,
                        fontSize,
                        this.pixelPositionX(x),
                        this.pixelPositionY(y - pixelsPerPage * page)
                    );
                    this.writeIndex(
                        indexX,
                        indexY - pixelsPerPage * page,
                        pixelsGrid[y][x].index,
                        pixelsGrid[y][x].indexColor
                    );
                }
            }
        }
    }

    private writeIndex(x: number, y: number, index: number, color: string) {
        if (!index) return;
        this.doc
            .fillColor(color ?? BLACK)
            .text(index.toString(), x, y, { lineBreak: false, });
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
        const textPosition = this.centeredPositionOfText(siteMark, this.FONT_SIZE);

        this.doc
            .fontSize(14)
            .fillColor(BLACK)
            .text(siteMark,
                textPosition,
                800
            );
    }

    private centeredPositionOfText(text: string, fontSize: number) {
        return (PDFBuilder.docSize.width / 2 - this.doc.fontSize(fontSize).widthOfString(text) / 2);
    }

    private centeredPositionOfIndex(index: number, fontSize: number, x: number, y: number) {
        return [
            x + (this.metadata.pixelSize - this.doc.fontSize(fontSize).widthOfString(index.toString())) / 2,
            y + (this.metadata.pixelSize - this.doc.fontSize(fontSize).heightOfString(index.toString())) / 2
        ] as const;
    }

    private setFontSize(fontSize = 40) {
        const textWidht = this.doc.fontSize(fontSize).widthOfString('88');
        const textHeight = this.doc.fontSize(fontSize).heightOfString('88');
        if (textHeight < this.metadata.pixelSize && textWidht < this.metadata.pixelSize) return fontSize;
        return this.setFontSize(fontSize - 2);
    }
}
