import { createWriteStream } from 'fs';
import * as PDFDocument from 'pdfkit';
import { FontLoader } from 'src/utils/font_loader';
import { half } from 'src/utils/half';
import { BLACK } from './colors';
import { GerdanOptions, PixelsGrid, Statistics } from './gerdan';

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
    private readonly options: GerdanOptions;
    private doc: typeof PDFDocument;
    constructor(path: string, metadata: MetaData, options: GerdanOptions) {
        this.options = options;
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
        const fromSite = `Зроблено на сайті ${process.env.SITE_MARK}`;
        const siteURL = process.env.SITE_URL;
        const byUser = `Автор: @${userName}`;
        const supportUsMessage = `Підтримати проєкт:`;

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
        if (process.env.SUPPORT_US_URL && process.env.SUPPORT_US_URL !== '') {
            this.doc.moveDown()
                .text(supportUsMessage, this.centeredPositionOfText(supportUsMessage, SUBTITLE_FONT))
                .text(process.env.SUPPORT_US_URL, this.centeredPositionOfText(process.env.SUPPORT_US_URL, SUBTITLE_FONT), null, { link: process.env.SUPPORT_US_URL, underline: true, oblique: true });
        }

        this.addSiteMark();
    }

    public closeDocument() {
        this.doc.end();
    }

    public drawStatistics(statistics: Statistics) {
        this.doc.fontSize(this.FONT_SIZE);
        this.doc.text(`Стовпців ${statistics.columns}, рядків: ${statistics.rows}.`, PDFBuilder.docSize.marginLeft, 320);

        const DEFAULT_PIXEL_SIZE = 25;
        const SPACE = 18;
        const MAX_ROWS = 15;
        const MAX_COLUMNS = 2;
        const initialTextPositionX = PDFBuilder.docSize.marginLeft;
        const initialTextPositionY = 330;
        let textPositionX = initialTextPositionX as number;

        function* pixelsGenerator() {
            for (const [key, value] of Object.entries(statistics.colors)) {
                yield [key, value];
            }
        }

        const pixels = pixelsGenerator();

        for (let x = 0; x < MAX_COLUMNS; x++) {
            let textPositionY = initialTextPositionY as number;
            for (let y = 0; y < MAX_ROWS; y++) {
                textPositionY += SPACE;
                const pixel = pixels.next();
                if (pixel.done) break;
                this.drawPixel(
                    textPositionX,
                    textPositionY,
                    pixel.value[1].color,
                    this.FONT_SIZE
                );

                this.doc
                    .fillColor(BLACK)
                    .text(`${pixel.value[0]}: ${pixel.value[1].color} - ${pixel.value[1].count} шт.`, textPositionX + DEFAULT_PIXEL_SIZE, textPositionY);
            }
            textPositionX += 250;
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
                if (this.options.numbers && color !== this.metadata.backgroundColor) {
                    const [indexX, indexY] = this.centeredPositionOfIndex(
                        pixelsGrid[y][x].index,
                        fontSize,
                        this.pixelPositionX(x),
                        this.pixelPositionY(y - pixelsPerPage * page)
                    );
                    this.writeIndex(
                        indexX,
                        indexY,
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
        return (half(PDFBuilder.docSize.width) - half(this.doc.fontSize(fontSize).widthOfString(text)));
    }

    private centeredPositionOfIndex(index: number, fontSize: number, x: number, y: number) {
        return [
            x + half(this.metadata.pixelSize - this.doc.fontSize(fontSize).widthOfString(index.toString())),
            y + half(this.metadata.pixelSize - this.doc.fontSize(fontSize).heightOfString(index.toString()))
        ] as const;
    }

    private setFontSize(fontSize = 40) {
        const textWidht = this.doc.fontSize(fontSize).widthOfString('88');
        const textHeight = this.doc.fontSize(fontSize).heightOfString('88');
        if (textHeight < this.metadata.pixelSize && textWidht < this.metadata.pixelSize) return fontSize;
        return this.setFontSize(fontSize - 2);
    }
}
