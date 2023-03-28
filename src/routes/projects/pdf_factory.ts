import { Project, ProjectTypeEnum, Schema, SchemaItem } from 'src/database/models/project.model';
import { FileStorageHelper } from 'src/utils/file_storage.helper';
import { half } from 'src/utils/half';
import { PDFBuilder } from './pdf_builder';
import { Bead, BeadSettings } from './resources/bead';

export class PDFFactory {
    private builder: PDFBuilder;
    private project: Project;
    private filePath: string;
    private parsedSchema: Schema;

    constructor(project: Project) {
        this.project = project;
        this.builder = new PDFBuilder(this.project.name, this.project.author.username);
        this.filePath = FileStorageHelper.prepareFilePathToTempFolder(`${project.author.username}-${project.name}`, 'pdf');
        this.parsedSchema = JSON.parse(project.schema);
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
        const bead = this.getScaledBead(ProjectTypeEnum.brick);

        this.builder
            .addPage()
            .setBead(bead)
            .setLineWidth(0.5)
            .setFont(this.builder.FONT.REGULAR)
            .setFontSize(this.builder.FONT_SIZE.SECONDARY);
        
        if (this.project.type === ProjectTypeEnum.peyote || this.project.type === ProjectTypeEnum.brick) {
            
        }

        // let x = 0, y = 0;
        // for (const row of instruction) {
        //     for (const item of row) {
        //         const text = `${item.count} шт.`;
        //         this.builder
        //             .setColor(item.color)
        //             .drawBead(x, y, item.symbol);
        //         x += bead.width;
        //         this.builder
        //             .setColor(this.builder.COLOR.BLACK)
        //             .writeText(text, x, y);
        //         x += text.length;
        //     }
        //     y += bead.height;
        // }

        // const initialY = this.builder.SIZE.MARGIN_TOP + this.builder.FONT_SIZE.SUBTITLE;
        // const initialX = this.builder.SIZE.MARGIN_LEFT as number;
        // const maxY = this.builder.SIZE.HEIGHT - this.builder.SIZE.MARGIN_BOTTOM;
        // const maxX = this.builder.SIZE.WIDTH - this.builder.SIZE.MARGIN_RIGHT;
        // let x = initialX;
        // let y = initialY;
        // const letterSpacing = 2;
        // const lineSpacing = 14;
        // const minX = 110;
        // for (let row = 0; row < instruction.length; row++) {
        //     if (y >= maxY) {
        //         y = initialY;
        //         this.builder.addPage();
        //     }
        //     const newRowText = `${row + 1} ряд: `;
        //     this.builder
        //         .setColor(this.builder.COLOR.BLACK)
        //         .writeText(newRowText, x, y);

        //     x = minX;
        //     for (let col = 0; col < instruction[row].length; col++) {
        //         if (x >= maxX) {
        //             y += lineSpacing;
        //             x = minX;
        //         }
        //         const text = `${instruction[row][col].count} шт.`;
        //         this.builder.drawBead(x, y, instruction[row][col].symbol);
        //         x += bead.width + letterSpacing;
        //         this.builder
        //             .setColor(this.builder.COLOR.BLACK)
        //             .writeText(text, x, y);
        //         x += 50;
        //     }
        //     y += lineSpacing;
        //     x = initialX;
        // }
        return this;
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
            const newColor = row[col].filled && row[col].color;
            const sameColor = newColor === color;
            if (!sameColor && color) result.push({ color, count, symbol });
            if (!sameColor) {
                color = newColor;
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

        let xShift = 0, yShift = 0;
        let colsCounter = 0, rowsCounter = 1;
        const halfBeadWidth = half(bead.width);
        const halfBeadHeight = half(bead.height);
        for (const slice of cut.slices) {
            for (let row = 0; row < slice.length; row++) {
                if (this.project.type === ProjectTypeEnum.brick) xShift = row % 2 ? halfBeadWidth : 0;
                const beadsOutOfPageHeight = !(row % beadsRowsPerPage);
                if (beadsOutOfPageHeight) {
                    if (colsCounter >= cut.totalCols) {
                        colsCounter = 0;
                        rowsCounter++;
                    }

                    this.builder
                        .addPage()
                        .addSliceInfo(rowsCounter, cut.totalRows, ++colsCounter, cut.totalCols);
                }

                for (let col = 0; col < slice[row].length; col++) {
                    if (this.project.type === ProjectTypeEnum.peyote) yShift = col % 2 ? halfBeadHeight : yShift = 0;
                    const x = col * bead.width + this.builder.SIZE.MARGIN_LEFT + xShift;
                    const y = row * bead.height + this.builder.SIZE.MARGIN_TOP + yShift;
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
        const rows = this.parsedSchema.length;
        const cols = Math.max(this.parsedSchema[0].length, this.parsedSchema[1].length);

        const slices: Schema[] = [];
        let totalRows = 0;
        let totalCols = 0;
        for (let i = 0; i < rows; i += rowsPerSlice) {
            totalCols = 0;
            for (let j = 0; j < cols; j += colsPerSlice) {
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
