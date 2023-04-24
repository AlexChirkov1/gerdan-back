import { createWriteStream } from 'fs';
import * as PDFDocument from 'pdfkit';
import { convertColorToMonochrome } from 'src/utils/convert_color_to_monochrome';
import { FontLoader } from 'src/utils/font_loader';
import { half } from 'src/utils/half';
import { Bead } from './resources/bead';

export class PDFBuilder {
    private readonly doc: typeof PDFDocument;
    SIZE = {
        WIDTH: 595.28,
        HEIGHT: 841.89,
        MARGIN_LEFT: 75.6,
        MARGIN_TOP: 37.8,
        MARGIN_RIGHT: 37.8,
        MARGIN_BOTTOM: 37.8,
    } as const;
    FONT_SIZE = {
        TITLE: 20,
        SUBTITLE: 16,
        PRIMARY: 12,
        SECONDARY: 10,
        PAGE_NUMBER: 12,
    } as const;
    FONT = {
        REGULAR: 'Roboto-Regular',
        MEDIUM: 'Roboto-Medium',
    } as const;
    COLOR = {
        BLACK: '#000000',
        WHITE: '#ffffff',
        GRAY: '#808080',
    } as const;
    PADDING = {
        LEFT: this.SIZE.MARGIN_LEFT,
        TOP: this.SIZE.MARGIN_TOP,
        RIGHT: this.SIZE.WIDTH - this.SIZE.MARGIN_RIGHT,
        BOTTOM: this.SIZE.HEIGHT - this.SIZE.MARGIN_BOTTOM,
    };
    pageCounter = 0;

    private settings: {
        fontSize: number,
        font: string,
        color: string,
        lineWidth: number,
        beadWidth: number,
        beadHeight: number,
        symbols: boolean,
    } = {
            fontSize: this.FONT_SIZE.PRIMARY,
            font: this.FONT.REGULAR,
            color: this.COLOR.BLACK,
            lineWidth: 1,
            beadWidth: 10,
            beadHeight: 10,
            symbols: true,
        };

    constructor(projectName: string, username: string) {
        this.doc = new PDFDocument({
            size: 'A4',
            margin: 0,
            layout: 'portrait',
            info: {
                Title: projectName,
                Author: username
            },
            pdfVersion: '1.7',
            autoFirstPage: false,
        });

        this.doc
            .registerFont(this.FONT.REGULAR, FontLoader.getRobotoRegular())
            .registerFont(this.FONT.MEDIUM, FontLoader.getRobotoMedium());
    }

    public get printWidth() { return this.SIZE.WIDTH - this.SIZE.MARGIN_LEFT - this.SIZE.MARGIN_RIGHT; }
    public get printHeight() { return this.SIZE.HEIGHT - this.SIZE.MARGIN_TOP - this.SIZE.MARGIN_BOTTOM; }

    public pipeTo(filePath: string) { this.doc.pipe(createWriteStream(filePath)); }
    public endPipe() { this.doc.end(); }

    public setBeadNumbers(state: boolean) {
        this.settings.symbols = state;
        return this;
    }

    public setFontSize(fontSize: typeof this.FONT_SIZE[keyof typeof this.FONT_SIZE]) {
        this.settings.fontSize = fontSize;
        this.doc.fontSize(this.settings.fontSize);
        return this;
    }
    public setFont(font: typeof this.FONT[keyof typeof this.FONT]) {
        this.settings.font = font;
        this.doc.font(this.settings.font);
        return this;
    }
    public setColor(color: string) {
        this.settings.color = color;
        this.doc.fillColor(this.settings.color);
        return this;
    }
    public setLineWidth(lineWidth: number) {
        this.settings.lineWidth = lineWidth;
        this.doc.lineWidth(this.settings.lineWidth);
        return this;
    }
    public setBead(bead: Bead) {
        this.settings.beadWidth = bead.width;
        this.settings.beadHeight = bead.height;
        return this;
    }

    public moveTextCursorDown() { this.doc.moveDown(); return this; }

    public addPage() {
        this.doc.addPage();
        if (this.pageCounter === 0) {
            ++this.pageCounter;
            return this;
        }
        this.doc
            .fontSize(this.FONT_SIZE.PAGE_NUMBER)
            .fillColor(this.COLOR.GRAY)
            .text((++this.pageCounter).toString(), this.PADDING.RIGHT, this.PADDING.BOTTOM)
            .fillColor(this.settings.color);
        return this;
    }

    public addSliceInfo(currentRow: number, totalRows: number, currentCol: number, totalCols: number) {
        let text = `Частина: ${currentRow}/${totalRows}`;
        if (totalCols > 1) text += `, Сторінка: ${currentCol}/${totalCols}`;

        this.doc
            .fontSize(this.FONT_SIZE.PAGE_NUMBER)
            .fillColor(this.COLOR.BLACK)
            .text(text, this.PADDING.LEFT, this.PADDING.BOTTOM)
            .fontSize(this.settings.fontSize)
            .fillColor(this.settings.color);
    }

    public writeText(text: string, x: number, y?: number) {
        this.doc.text(text, x, y);
        return this;
    }
    public writeLink(text: string, link: string, x: number, y?: number) {
        this.doc.text(text, x, y, { link, underline: true, oblique: true });
        return this;
    }

    public drawBead(x: number, y: number, symbol?: string) {
        this.doc
            .rect(x, y, this.settings.beadWidth - this.settings.lineWidth, this.settings.beadHeight - this.settings.lineWidth)
            .fillAndStroke(this.settings.color, this.COLOR.GRAY);

        if (symbol && this.settings.symbols) {
            const xSymbol = x + this.getCenteredPositionOfText(symbol, this.settings.beadWidth);
            const ySymbol = y + this.getMiddledPositionOfText(symbol, this.settings.beadHeight);
            this.doc
                .fillColor(convertColorToMonochrome(this.settings.color))
                .text(symbol, xSymbol, ySymbol, { lineBreak: false });
        }
        return this;
    }

    public drawLine(startX: number, startY: number, endX: number, endY: number) {
        this.doc
            .moveTo(startX, startY)
            .lineTo(endX, endY)
            .stroke(this.settings.color);
        return this;
    }

    public getCenteredPositionOfText(text: string, width: number) {
        return half(width) - half(this.doc.widthOfString(text));
    }

    public getMiddledPositionOfText(text: string, height: number) {
        return half(height) - half(this.doc.heightOfString(text));
    }

    public getTextWidth(text: string) {
        return this.doc.widthOfString(text);
    }
    public getTextHeight(text: string) {
        return this.doc.heightOfString(text);
    }

}
