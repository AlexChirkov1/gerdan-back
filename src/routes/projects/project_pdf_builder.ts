import { createWriteStream } from 'fs';
import * as PDFDocument from 'pdfkit';
import { Schema } from 'src/database/models/project.model';
import { FontLoader } from 'src/utils/font_loader';
import { half } from 'src/utils/half';

export class ProjectPDFBuilder {
    private doc: typeof PDFDocument;
    SIZES = {
        WIDTH: 595.28,
        HEIGHT: 841.89,
        MARGIN_LEFT: 75.6,
        MARGIN_TOP: 37.8,
        MARGIN_RIGHT: 37.8,
        MARGIN_BOTTOM: 37.8,
    } as const;
    COLORS = {
        BLACK: '#000000',
        WHITE: '#ffffff',
        GRAY: '#808080',
    } as const;
    FONTS = {
        TITLE: 24,
        SUBTITLE: 16,
        SITE_MARK: 16,
        SCHEMA_NUMBER: 8,
    } as const;
    pageCounter = 0;

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
        });

        this.doc
            .registerFont('Roboto-Regular', FontLoader.getRobotoRegular())
            .registerFont('Roboto-Medium', FontLoader.getRobotoMedium())
            .font('Roboto-Regular');
    }

    public get printWidth() { return this.SIZES.WIDTH - this.SIZES.MARGIN_LEFT - this.SIZES.MARGIN_RIGHT; }
    public get printHeight() { return this.SIZES.HEIGHT - this.SIZES.MARGIN_TOP - this.SIZES.MARGIN_BOTTOM; }

    public pipeTo(filePath: string) {
        this.doc.pipe(createWriteStream(filePath));
    }

    public endPipe() {
        this.doc.end();
    }

    public getCenteredPositionOfText(text: string, fontSize: number, width: number) {
        return half(width) - half(this.doc.fontSize(fontSize).widthOfString(text));
    }

    public getMiddledPositionOfText(text: string, fontSize: number, height: number) {
        return half(height) - half(this.doc.fontSize(fontSize).heightOfString(text));
    }

    public getWidthOfText(text: string, fontSize: number) {
        return this.doc.fontSize(fontSize).widthOfString(text);
    }

    public getHeightOfText(text: string, fontSize: number) {
        return this.doc.fontSize(fontSize).heightOfString(text);
    }

    public convertColorToBlackOrWhite(hex: string, options = { black: '#000000', white: '#FFFFFF' }): string {
        const redNumber = parseInt(hex.slice(1, 3), 16),
            greenNumber = parseInt(hex.slice(3, 5), 16),
            blueNumber = parseInt(hex.slice(5, 7), 16);
        return redNumber * 0.299 + greenNumber * 0.587 + blueNumber * 0.114 > 186 ? options.black : options.white;
    }

    public addPage() {
        this.doc.addPage();
        this.pageCounter++;
    }

    public addPageNumber() {
        this.doc
            .fontSize(this.FONTS.SCHEMA_NUMBER)
            .fillColor(this.COLORS.GRAY)
            .text(this.pageCounter.toString(), this.SIZES.WIDTH - this.SIZES.MARGIN_RIGHT, this.SIZES.HEIGHT - this.SIZES.MARGIN_BOTTOM);
    }

    public addSliceInfo(currentRow: number, totalRows: number, currentCol: number, totalCols: number) {
        let text = `Частина: ${currentRow}/${totalRows}`;
        if (totalCols) text += `, Сторінка: ${currentCol}/${totalCols}`;

        this.doc
            .fontSize(this.FONTS.SCHEMA_NUMBER)
            .fillColor(this.COLORS.BLACK)
            .text(text, this.SIZES.MARGIN_LEFT, this.SIZES.HEIGHT - this.SIZES.MARGIN_BOTTOM);
    }

    public addSiteMark() {
        const siteMark = process.env.SITE_MARK as string;
        const textPosition = this.getCenteredPositionOfText(siteMark, this.FONTS.SITE_MARK, this.SIZES.WIDTH);

        this.doc
            .fontSize(this.FONTS.SITE_MARK)
            .fillColor(this.COLORS.BLACK)
            .text(siteMark, textPosition, this.SIZES.HEIGHT - this.SIZES.MARGIN_BOTTOM);
    }

    public addStatistics(schema: Schema) {
        const SPACE = 25;
        const MAX_ROWS = 15;
        const MAX_COLUMNS = 2;
        const initialTextPositionX = this.SIZES.MARGIN_LEFT;
        const initialTextPositionY = 330;
        const statisticObject = {};

        for (let row = 0; row < schema.length; row++) {
            for (let col = 0; col < schema[row].length; col++) {
                if (!schema[row][col].filled) continue;
                if (!statisticObject[schema[row][col].number]) {
                    statisticObject[schema[row][col].number] = {
                        number: schema[row][col].number.toString(),
                        color: schema[row][col].color,
                        count: 0
                    };
                }
                statisticObject[schema[row][col].number].count++;
            }
        }

        function* statisticsGenerator(statistics: Record<string, { number: string, color: string, count: number; }>): any {
            for (const key of Object.keys(statistics)) {
                yield statistics[key];
            }
        }

        const statistics = statisticsGenerator(statisticObject);
        const bead = {
            width: 30,
            height: 20,
        };

        let textPositionX = initialTextPositionX;
        for (let x = 0; x < MAX_COLUMNS; x++) {
            let textPositionY = initialTextPositionY;
            for (let y = 0; y < MAX_ROWS; y++) {
                textPositionY += SPACE;
                const item = statistics.next();
                if (item.done) break;

                this.drawBead(
                    textPositionX,
                    textPositionY,
                    bead.width,
                    bead.height,
                    item.value.color
                );

                const xPos = x + this.getCenteredPositionOfText(item.value.number, this.FONTS.SUBTITLE, bead.width);
                this.doc
                    .fontSize(this.FONTS.SUBTITLE)
                    .fillColor(this.convertColorToBlackOrWhite(item.value.color))
                    .text(item.value.number, textPositionX + xPos, textPositionY, { lineBreak: false });

                this.doc
                    .font('Roboto-Regular')
                    .fontSize(this.FONTS.SUBTITLE)
                    .fillColor(this.COLORS.BLACK)
                    .text(`${item.value.color.toUpperCase()} — ${item.value.count} шт.`, textPositionX + bead.width * 1.5, textPositionY);
            }
            textPositionX += 250;
        }
    }

    public addInfoPage(projectName: string, username: string) {
        this.addProjectTitle(projectName);
        this.doc.moveDown();
        this.addUsernameSubtitle(username);
        this.doc.moveDown();
        this.doc.moveDown();
        this.addSiteInfo();
        this.addDonationInfo();
        this.addSiteMark();
    }

    private addProjectTitle(projectName: string) {
        this.doc
            .font('Roboto-Medium')
            .fontSize(this.FONTS.TITLE)
            .text(projectName, this.getCenteredPositionOfText(projectName, this.FONTS.TITLE, this.SIZES.WIDTH), 100);
    }

    private addUsernameSubtitle(username: string) {
        const byUser = `Автор: @${username}`;
        this.doc
            .font('Roboto-Regular')
            .fontSize(this.FONTS.SUBTITLE)
            .text(byUser, this.getCenteredPositionOfText(byUser, this.FONTS.SUBTITLE, this.SIZES.WIDTH));
    }

    private addSiteInfo() {
        const fromSite = `Зроблено на сайті ${process.env.SITE_MARK}`;
        const siteURL = process.env.SITE_URL;
        this.doc
            .font('Roboto-Regular')
            .fontSize(this.FONTS.SUBTITLE)
            .text(fromSite, this.getCenteredPositionOfText(fromSite, this.FONTS.SUBTITLE, this.SIZES.WIDTH))
            .text(siteURL, this.getCenteredPositionOfText(siteURL, this.FONTS.SUBTITLE, this.SIZES.WIDTH), null, { link: process.env.SITE_URL, underline: true, oblique: true });
    }

    private addDonationInfo() {
        if (!process.env.SUPPORT_US_URL || process.env.SUPPORT_US_URL === '') return;
        const supportUsMessage = `Підтримати проєкт:`;
        this.doc
            .font('Roboto-Regular')
            .fontSize(this.FONTS.SUBTITLE)
            .moveDown()
            .text(supportUsMessage, this.getCenteredPositionOfText(supportUsMessage, this.FONTS.SUBTITLE, this.SIZES.WIDTH))
            .text(process.env.SUPPORT_US_URL, this.getCenteredPositionOfText(process.env.SUPPORT_US_URL, this.FONTS.SUBTITLE, this.SIZES.WIDTH), null, { link: process.env.SUPPORT_US_URL, underline: true, oblique: true });
    }

    public drawBead(x: number, y: number, width: number, height: number, color: string) {
        const lineWidth = 0.5;
        this.doc
            .lineWidth(lineWidth)
            .rect(x, y, width - lineWidth, height - lineWidth)
            .fillAndStroke(color, this.convertColorToBlackOrWhite(color, { black: '#3B3B3B', white: '#AEAEAE' }));
    }

    public writeBeadColorNumber(x: number, y: number, width: number, height: number, number: string, color: string) {
        const xPos = x + this.getCenteredPositionOfText(number, this.FONTS.SCHEMA_NUMBER, width);
        const yPos = y + this.getMiddledPositionOfText(number, this.FONTS.SCHEMA_NUMBER, height);
        this.doc
            .fontSize(this.FONTS.SCHEMA_NUMBER)
            .fillColor(this.convertColorToBlackOrWhite(color))
            .text(number, xPos, yPos, { lineBreak: false, });
    }

    public writeRulerNumber(x: number, y: number, number: string) {
        this.doc
            .fontSize(this.FONTS.SCHEMA_NUMBER)
            .fillColor(this.COLORS.GRAY)
            .text(number, x, y, { lineBreak: false, });
    }

    public drawRulerLine(startX: number, startY: number, endX: number, endY: number) {
        const lineWidth = 0.5;
        this.doc
            .lineWidth(lineWidth)
            .moveTo(startX, startY)
            .lineTo(endX, endY)
            .stroke(this.COLORS.GRAY);
    }
}
