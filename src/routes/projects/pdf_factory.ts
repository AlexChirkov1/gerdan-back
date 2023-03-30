import { Project, ProjectTypeEnum, Schema, SchemaItem } from 'src/database/models/project.model';
import { FileStorageHelper } from 'src/utils/file_storage.helper';
import { half } from 'src/utils/half';
import { PDFBuilder } from './pdf_builder';
import { Bead, BeadSettings } from './resources/bead';

type PDFOptions = {
    numbers: boolean;
    rulers: boolean;
};
export class PDFFactory {
    private builder: PDFBuilder;
    private project: Project;
    private filePath: string;
    private parsedSchema: Schema;

    constructor(project: Project, private readonly options: PDFOptions) {
        this.project = project;
        this.builder = new PDFBuilder(this.project.name, this.project.author.username);
        this.filePath = FileStorageHelper.prepareFilePathToTempFolder(`${project.author.username}-${project.name}`, 'pdf');
        this.parsedSchema = JSON.parse(project.schema);
        if (!this.options.numbers) this.builder.setBeadNumbers(false);
    }

    startDocument() {
        this.builder.pipeTo(this.filePath);
        return this;
    }

    async endDocument() {
        this.builder.endPipe();
        // return await FileStorageHelper.extractFile(this.filePath);
    }

    addInfoPage() {
        const byUserText = `Автор: @${this.project.author.username}`;
        const fromSite = `Зроблено на сайті ${process.env.SITE_MARK}`;
        const siteURL = process.env.SITE_URL;

        this.builder
            .addPage()
            .setFont(this.builder.FONT.MEDIUM)
            .setFontSize(this.builder.FONT_SIZE.TITLE)
            .writeText(this.project.name, this.builder.getCenteredPositionOfText(this.project.name, this.builder.SIZE.WIDTH), 100)
            .moveTextCursorDown()
            .setFont(this.builder.FONT.REGULAR)
            .setFontSize(this.builder.FONT_SIZE.SUBTITLE)
            .writeText(byUserText, this.builder.getCenteredPositionOfText(byUserText, this.builder.SIZE.WIDTH))
            .moveTextCursorDown()
            .writeText(fromSite, this.builder.getCenteredPositionOfText(fromSite, this.builder.SIZE.WIDTH))
            .writeLink(siteURL, siteURL, this.builder.getCenteredPositionOfText(siteURL, this.builder.SIZE.WIDTH));

        if (process.env.SUPPORT_US_URL && process.env.SUPPORT_US_URL !== '') {
            const supportUsMessage = 'Підтримати проєкт: ';
            const supportUsURL = process.env.SUPPORT_US_URL;
            this.builder
                .moveTextCursorDown()
                .writeText(supportUsMessage, this.builder.getCenteredPositionOfText(supportUsMessage, this.builder.SIZE.WIDTH))
                .writeLink(supportUsURL, supportUsURL, this.builder.getCenteredPositionOfText(supportUsURL, this.builder.SIZE.WIDTH));
        }

        this.addStatistics();
        this.addSiteMark();
        return this;
    }

    addInstruction() {
        const instruction = this.getParsedInstructions();

        if (this.project.type === ProjectTypeEnum.peyote || this.project.type === ProjectTypeEnum.brick) this.addPeyoteInstruction(instruction);
        if (this.project.type === ProjectTypeEnum.grid || this.project.type === ProjectTypeEnum.loom) this.addGridInstruction(instruction);

        return this;
    }

    private addGridInstruction(instruction: { color: string, count: number, symbol: string; }[][]) {
        const bead = this.getScaledBead(ProjectTypeEnum.brick);
        this.builder.addPage();
        this.addSiteMark();
        this.builder
            .setBead(bead)
            .setLineWidth(0.5)
            .setFont(this.builder.FONT.REGULAR)
            .setFontSize(this.builder.FONT_SIZE.SECONDARY);

        let x = this.builder.PADDING.LEFT as number, y = this.builder.PADDING.TOP as number;
        const lineSpacing = bead.height + half(bead.height);
        const beadSpacing = bead.width * .25;
        let rowsCounter = 0;
        for (const row of instruction) {
            const newRowText = `${++rowsCounter} ряд:`;
            const newRowTextLength = this.builder.getTextWidth(newRowText) + beadSpacing;
            this.builder.writeText(newRowText, x, y);
            x += newRowTextLength;
            for (const item of row) {
                const text = ` — ${item.count} шт.`;
                const cellLength = bead.width + beadSpacing + this.builder.getTextWidth(text);
                if (x + cellLength >= this.builder.PADDING.RIGHT) x = this.builder.PADDING.LEFT + newRowTextLength;
                this.builder
                    .setColor(item.color)
                    .drawBead(x, y, item.symbol);
                x += bead.width;
                this.builder
                    .setColor(this.builder.COLOR.BLACK)
                    .writeText(text, x, y);
                x += beadSpacing + this.builder.getTextWidth(text);
            }
            y += bead.height + lineSpacing;
            x = this.builder.PADDING.LEFT;
            if (y >= this.builder.PADDING.BOTTOM) {
                y = this.builder.PADDING.TOP;
                this.builder.addPage();
                this.addSiteMark();
                this.builder
                    .setFont(this.builder.FONT.REGULAR)
                    .setFontSize(this.builder.FONT_SIZE.SECONDARY);
            }
        }
    }

    private addPeyoteInstruction(instruction: { color: string, count: number, symbol: string; }[][]) {
        const bead = this.getScaledBead(ProjectTypeEnum.brick);
        this.builder.addPage()
        this.addSiteMark();
        this.builder
            .setBead(bead)
            .setLineWidth(0.5)
            .setFont(this.builder.FONT.REGULAR)
            .setFontSize(this.builder.FONT_SIZE.SECONDARY);

        let x = this.builder.PADDING.LEFT as number, y = this.builder.PADDING.TOP as number;
        const lineSpacing = bead.height + half(bead.height);
        const beadSpacing = bead.width * .25;
        let rowsCounter = 0;
        for (const row of instruction) {
            const reversed = ++rowsCounter % 2 === 0;
            const newRowText = rowsCounter + ' ряд ' + (reversed ? '(навпаки):' : ':');
            const newRowTextLength = this.builder.getTextWidth(newRowText) + beadSpacing;
            this.builder.writeText(newRowText, x, y);
            x += newRowTextLength;
            for (let i = 0; i < row.length; i++) {
                const itemIndex = reversed ? row.length - 1 - i : i;
                const text = ` — ${row[itemIndex].count} шт.`;
                const cellLength = bead.width + beadSpacing + this.builder.getTextWidth(text);
                if (x + cellLength >= this.builder.PADDING.RIGHT) x = this.builder.PADDING.LEFT + newRowTextLength;
                this.builder
                    .setColor(row[itemIndex].color)
                    .drawBead(x, y, row[itemIndex].symbol);
                x += bead.width;
                this.builder
                    .setColor(this.builder.COLOR.BLACK)
                    .writeText(text, x, y);
                x += beadSpacing + this.builder.getTextWidth(text);
            }
            y += bead.height + lineSpacing;
            x = this.builder.PADDING.LEFT;
            if (y >= this.builder.PADDING.BOTTOM) {
                y = this.builder.PADDING.TOP;
                this.builder.addPage();
                this.addSiteMark();
                this.builder
                    .setFont(this.builder.FONT.REGULAR)
                    .setFontSize(this.builder.FONT_SIZE.SECONDARY);
            }
        }
    }

    private getParsedInstructions() {
        const linesMetadata: { color: string, count: number, symbol: string; }[][] = [];
        for (let row = 0; row < this.parsedSchema.length; row++) linesMetadata.push(this.countAndGroupConsecutiveColors(this.parsedSchema[row]));
        return linesMetadata;
    }

    private countAndGroupConsecutiveColors(row: SchemaItem[]) {
        const result = [];
        let color = null;
        let count = 0;
        let symbol = null;
        for (let col = 0; col < row.length; col++) {
            if (!row[col].filled) continue;
            const sameColor = row[col].color === color;
            if (!sameColor && color) result.push({ color, count, symbol });
            if (!sameColor) {
                color = row[col].color;
                count = 0;
                symbol = row[col].number?.toString();
            }
            if (color) count++;
        }
        if (color) result.push({ color, count, symbol });
        return result;
    }

    addSchema() {
        const bead = this.getScaledBead(this.project.type);
        let beadsRowsPerPage = ~~(this.builder.printHeight / bead.height);
        if (this.project.type === ProjectTypeEnum.peyote) --beadsRowsPerPage;
        const beadsColsPerPage = ~~(this.builder.printWidth / bead.width);

        const cut = this.cutSchemaIntoSlices(bead, beadsRowsPerPage, beadsColsPerPage);

        this.builder
            .setBead(bead)
            .setLineWidth(0.5)
            .setFont(this.builder.FONT.REGULAR)
            .setFontSize(this.builder.FONT_SIZE.SECONDARY);

        let isReversedBrick = false;
        if (this.project.type === ProjectTypeEnum.brick) isReversedBrick = this.parsedSchema[0].length < this.parsedSchema[1].length;

        let xShift = 0, yShift = 0;
        let colsCounter = 0, rowsCounter = 1;
        const halfBeadWidth = half(bead.width);
        const halfBeadHeight = half(bead.height);
        let rulerColsCounter = 0, rulerRowsCounter = 0;
        for (const slice of cut.slices) {
            for (let row = 0; row < slice.length; row++) {
                if (this.project.type === ProjectTypeEnum.brick) {
                    if (isReversedBrick) xShift = row % 2 ? 0 : halfBeadWidth;
                    else xShift = row % 2 ? halfBeadWidth : 0;
                }
                const beadsOutOfPageHeight = !(row % beadsRowsPerPage);
                if (beadsOutOfPageHeight) {
                    if (colsCounter >= cut.totalCols) {
                        colsCounter = 0;
                        rulerColsCounter = 0;
                        rowsCounter++;
                    }

                    this.builder.addPage();
                    this.addSiteMark();
                    this.builder
                        .setFont(this.builder.FONT.REGULAR)
                        .setFontSize(this.builder.FONT_SIZE.SECONDARY)
                        .addSliceInfo(rowsCounter, cut.totalRows, ++colsCounter, cut.totalCols);

                    if (this.options.rulers) {
                        let x = 0, y = 0;
                        let rulerText = '';
                        let centeredPositionOfText = 0;
                        this.builder.setColor(this.builder.COLOR.GRAY);
                        for (let col = 0; col < slice[row].length; col++) {
                            rulerText = (++rulerColsCounter).toString();
                            centeredPositionOfText = this.builder.getCenteredPositionOfText(rulerText, bead.width);
                            x = this.builder.PADDING.LEFT + col * bead.width + xShift;
                            y = this.builder.PADDING.TOP - bead.height;
                            if (!(rulerColsCounter % 5)) this.builder.writeText(rulerText, x + centeredPositionOfText, y);
                            this.builder.drawLine(
                                x + halfBeadWidth,
                                y + bead.height * .75,
                                x + halfBeadWidth,
                                y + bead.height
                            );
                        }
                    }
                }

                if (this.options.rulers) {
                    const x = this.builder.PADDING.LEFT;
                    const y = this.builder.PADDING.TOP + row * bead.height + yShift;
                    const rulerText = (++rulerRowsCounter).toString();
                    const middledPositionOfText = this.builder.getMiddledPositionOfText(rulerText, bead.height);
                    this.builder.setColor(this.builder.COLOR.GRAY);
                    if (!(rulerRowsCounter % 10)) this.builder.writeText(rulerText, x - bead.width, y + middledPositionOfText);
                    this.builder.drawLine(
                        x,
                        y + bead.height,
                        !(rulerRowsCounter % 10) ? x - bead.width : x - halfBeadWidth,
                        y + bead.height
                    );
                }

                for (let col = 0; col < slice[row].length; col++) {
                    if (this.project.type === ProjectTypeEnum.peyote) yShift = col % 2 ? halfBeadHeight : yShift = 0;
                    const x = col * bead.width + this.builder.PADDING.LEFT + xShift;
                    const y = row * bead.height + this.builder.PADDING.TOP + yShift;
                    const color = slice[row][col].filled ? slice[row][col].color : this.project.backgroundColor;
                    this.builder
                        .setColor(color)
                        .drawBead(x, y, slice[row][col].number?.toString());
                }
            }
        }
        return this;
    }

    private cutSchemaIntoSlices(bead: Bead, rowsPerSlice: number, colsPerSlice: number) {
        const slices: Schema[] = [];
        let totalRows = 0;
        let totalCols = 0;
        for (let i = 0; i < this.parsedSchema.length; i += rowsPerSlice) {
            totalCols = 0;
            for (let j = 0; j < this.parsedSchema[i].length; j += colsPerSlice) {
                slices.push(this.sliceSchema(bead, i, rowsPerSlice, j, colsPerSlice));
                totalCols++;
            }
            totalRows++;
        }

        return { slices, totalRows, totalCols };
    }

    private sliceSchema(bead: Bead, currentRow: number, totalRows: number, currentCol: number, totalCols: number) {
        return this.parsedSchema
            .slice(currentRow, currentRow + totalRows)
            .map(row => row
                .slice(currentCol, currentCol + totalCols)
                .map(slice => ({
                    ...slice,
                    x: slice.x - totalCols * bead.width,
                    y: slice.y - totalRows * bead.height,
                }))
            );
    }

    private addStatistics() {
        const statistic: { number: string, color: string, count: number; }[] = [];
        for (const row of this.parsedSchema) {
            for (const cell of row) {
                if (!cell.filled) continue;
                const index = statistic.findIndex(item => item.color === cell.color);
                if (index === -1) {
                    statistic.push({
                        number: cell.number.toString(),
                        color: cell.color,
                        count: 1
                    });
                } else {
                    statistic[index].count++;
                }
            }
        }
        statistic.sort((first, second) => second.count - first.count);

        const bead = this.getScaledBead(ProjectTypeEnum.brick);
        this.builder
            .setBead(bead)
            .setLineWidth(0.5)
            .setFont(this.builder.FONT.REGULAR)
            .setFontSize(this.builder.FONT_SIZE.SECONDARY)
            .setColor(this.builder.COLOR.BLACK);

        const initialY = 330;
        let x = this.builder.PADDING.LEFT;
        let y = initialY;
        const lineSpacing = bead.height + half(bead.height);
        const beadSpacing = bead.width;
        const columnSpacing = 200;
        for (const item of statistic) {
            const text = ` — ${item.count} шт.`;
            this.builder
                .setColor(item.color)
                .drawBead(x, y, item.number)
                .setColor(this.builder.COLOR.BLACK)
                .writeText(text, x + beadSpacing, y + this.builder.getMiddledPositionOfText(text, bead.height));

            y += lineSpacing;
            if (y >= this.builder.PADDING.BOTTOM) {
                y = initialY;
                x += columnSpacing;
            }
        }
        return this;
    }

    private addSiteMark() {
        const siteMark = process.env.SITE_MARK;
        this.builder
            .setFont(this.builder.FONT.REGULAR)
            .setFontSize(this.builder.FONT_SIZE.PRIMARY)
            .setColor(this.builder.COLOR.BLACK)
            .writeText(siteMark, this.builder.getCenteredPositionOfText(siteMark, this.builder.SIZE.WIDTH), this.builder.PADDING.BOTTOM);
    }

    private getScaledBead(type: ProjectTypeEnum): Bead {
        const scaleFactor = 0.5;
        return {
            width: BeadSettings[type].width * scaleFactor,
            height: BeadSettings[type].height * scaleFactor,
        };
    }
}
