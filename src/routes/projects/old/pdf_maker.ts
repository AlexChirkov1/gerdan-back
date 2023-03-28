import { Project, ProjectTypeEnum, Schema } from 'src/database/models/project.model';
import { FileStorageHelper } from 'src/utils/file_storage.helper';
import { half } from 'src/utils/half';
import { SchemaItem } from '../dtos/input_types';
import { Bead, BeadSettings } from '../resources/bead';
import { ProjectPDFBuilder } from './project_pdf_builder';

export async function makePdfDocument(project: Project) {
    const builder = new ProjectPDFBuilder(project.name, project.author.username);
    const filePath = FileStorageHelper.prepareFilePathToTempFolder(`${project.author.username}-${project.name}`, 'pdf');
    builder.pipeTo(filePath);
    builder.addInfoPage(project.name, project.author.username);

    const parsedSchema: Schema = JSON.parse(project.schema);
    builder.addStatistics(parsedSchema);

    drawSchema(builder, parsedSchema, project.type, project.backgroundColor);
    makeInstruction(builder, parsedSchema, project.type);

    builder.endPipe();
    // return await FileStorageHelper.extractFile(filePath);
}

function makeInstruction(builder: ProjectPDFBuilder, schema: Schema, type: ProjectTypeEnum) {
    // пейот + брік
    // 1. перший рядок повністю
    // 2. другий рядок через один (перша половина) в обратному порядку поштучно
    // 3. другий рядок через один (друга половина)
    // 4. повторити 2 крок
    return makeBrickInstruction(builder, schema);
}

function makeBrickInstruction(builder: ProjectPDFBuilder, schema: Schema) {
    const bead = getScaledBeadsSize(ProjectTypeEnum.brick);

    const initialY = builder.SIZES.MARGIN_TOP + builder.FONTS.SUBTITLE;
    const initialX = builder.SIZES.MARGIN_LEFT as number;
    const maxY = builder.SIZES.HEIGHT - builder.SIZES.MARGIN_BOTTOM;
    const maxX = builder.SIZES.WIDTH - builder.SIZES.MARGIN_RIGHT;
    let x = initialX;
    let y = initialY;
    const letterSpacing = 2;
    const lineSpacing = 14;
    const minX = 110;

    builder.addPage();
    for (let col = 0; col < schema[0].length; col++) {
        if (!schema[0][col].filled) continue;
        builder.drawBead(x, y, bead.width, bead.height, schema[0][col].color);
        builder.writeBeadColorNumber(x, y, bead.width, bead.height, schema[0][col].number.toString(), schema[0][col].color);
        x += bead.width + letterSpacing;
    }

    for (let row = 1; row < schema.length; row++) {
        if (x >= maxX) {
            y += lineSpacing;
            x = minX;
        }
        for (let col = schema[row].length; col > schema[row].length; col--) {
            if (!schema[row][col].filled) continue;
            if (col % 2) {
                builder.drawBead(x, y, bead.width, bead.height, schema[row][col].color);
                builder.writeBeadColorNumber(x, y, bead.width, bead.height, schema[row][col].number.toString(), schema[row][col].color);
                x += bead.width + letterSpacing;
            }
        }
        for (let col = 0; col < schema[row].length; col++) {
            if (!schema[row][col].filled) continue;
            if (!(col % 2)) {
                builder.drawBead(x, y, bead.width, bead.height, schema[row][col].color);
                builder.writeBeadColorNumber(x, y, bead.width, bead.height, schema[row][col].number.toString(), schema[row][col].color);
                x += bead.width + letterSpacing;
            }
        }
    }
}

function makeGridInstruction(builder: ProjectPDFBuilder, schema: Schema) {
    const linesMetadata = [];
    for (let row = 0; row < schema.length; row++) linesMetadata.push(countAndGroupConsecutiveColors(schema[row]));

    const bead = getScaledBeadsSize(ProjectTypeEnum.brick);

    const initialY = builder.SIZES.MARGIN_TOP + builder.FONTS.SUBTITLE;
    const initialX = builder.SIZES.MARGIN_LEFT as number;
    const maxY = builder.SIZES.HEIGHT - builder.SIZES.MARGIN_BOTTOM;
    const maxX = builder.SIZES.WIDTH - builder.SIZES.MARGIN_RIGHT;
    let x = initialX;
    let y = initialY;
    const letterSpacing = 2;
    const lineSpacing = 14;
    const minX = 110;
    builder.addPage();
    for (let row = 0; row < linesMetadata.length; row++) {
        if (y >= maxY) {
            y = initialY;
            builder.addPage();
        }
        const newRowText = `${row + 1} ряд: `;
        builder.doc.fontSize(builder.FONTS.SCHEMA_NUMBER)
            .fillColor(builder.COLORS.BLACK)
            .text(newRowText, x, y, { lineBreak: false, });
        x = minX;
        for (let col = 0; col < linesMetadata[row].length; col++) {
            if (x >= maxX) {
                y += lineSpacing;
                x = minX;
            }
            const text = `${linesMetadata[row][col].count} шт.`;
            builder.drawBead(x, y, bead.width, bead.height, linesMetadata[row][col].color);
            builder.writeBeadColorNumber(x, y, bead.width, bead.height, linesMetadata[row][col].number.toString(), linesMetadata[row][col].color);
            x += bead.width + letterSpacing;
            builder.doc.fontSize(builder.FONTS.SCHEMA_NUMBER)
                .fillColor(builder.COLORS.BLACK)
                .text(text, x, y, { lineBreak: false, });
            x += builder.getWidthOfText(text, builder.FONTS.SCHEMA_NUMBER) + letterSpacing;
        }
        y += lineSpacing;
        x = initialX;
    }
}

function countAndGroupConsecutiveColors(row: SchemaItem[]) {
    const result = [];
    let color = null;
    let count = 0;
    let number = null;
    for (let col = 0; col < row.length; col++) {
        const newColor = row[col].filled && row[col].color;
        const sameColor = newColor === color;
        if (!sameColor && color) result.push({ color, count, number });
        if (!sameColor) {
            color = newColor;
            count = 0;
            number = row[col].number;
        }
        if (color) count++;
    }
    if (color) result.push({ color, count, number });
    return result;
}

function drawSchema(builder: ProjectPDFBuilder, parsedSchema: Schema, type: ProjectTypeEnum, backgroundColor: string) {
    const bead = getScaledBeadsSize(type);
    const beadsRowsPerPage = ~~(builder.printHeight / bead.height);
    const beadsColsPerPage = ~~(builder.printWidth / bead.width);
    const cut = cutSchemaIntoSlices(parsedSchema, bead, beadsRowsPerPage, beadsColsPerPage);

    let xShift = 0, yShift = 0;
    let colsCounter = 0, rowsCounter = 1;
    // let globalRowsCounter = 0;
    // let globalColsCounter = 0;
    const halfBeadWidth = half(bead.width);
    const halfBeadHeight = half(bead.height);
    for (const slice of cut.slices) {
        for (let row = 0; row < slice.length; row++) {
            if (type === ProjectTypeEnum.brick) xShift = row % 2 ? halfBeadWidth : 0;

            const beadsOutOfPageHeight = !(row % beadsRowsPerPage);
            if (beadsOutOfPageHeight) {
                if (colsCounter >= cut.totalCols) {
                    colsCounter = 0;
                    // globalColsCounter = 0;
                    rowsCounter++;
                }

                builder.addPage();
                builder.addPageNumber();
                builder.addSliceInfo(rowsCounter, cut.totalRows, ++colsCounter, cut.totalCols);
                builder.addSiteMark();

                // {
                //     let x = 0, y = 0;
                //     let columnText = '';
                //     for (let col = 0; col < slice[row].length; col++) {
                //         columnText = (++globalColsCounter).toString();
                //         const centeredPositionOfText = builder.getCenteredPositionOfText(columnText, builder.FONTS.SCHEMA_NUMBER, bead.width);
                //         x = col * bead.width + builder.SIZES.MARGIN_LEFT + xShift + centeredPositionOfText;
                //         y = builder.SIZES.MARGIN_TOP + builder.getMiddledPositionOfText(columnText, builder.FONTS.SCHEMA_NUMBER, bead.height) - bead.height * .75;
                //         if (!(globalColsCounter % 5)) builder.writeRulerNumber(x, y, columnText);
                //         builder.drawRulerLine(
                //             x - centeredPositionOfText + halfBeadWidth,
                //             y + bead.height * .75,
                //             x - centeredPositionOfText + halfBeadWidth,
                //             y + bead.height
                //         );
                //     }
                // }
            }

            // {
            //     let x = 0, y = 0;
            //     const rowText = (++globalRowsCounter).toString();
            //     const widthOfText = builder.getWidthOfText(rowText, builder.FONTS.SCHEMA_NUMBER);
            //     x = builder.SIZES.MARGIN_LEFT - widthOfText - halfBeadWidth;
            //     y = row * bead.height + builder.SIZES.MARGIN_TOP + yShift;
            //     if (!(globalRowsCounter % 10)) builder.writeRulerNumber(x, y, rowText);
            //     builder.drawRulerLine(
            //         x + widthOfText + bead.width * 0.25,
            //         y + halfBeadHeight,
            //         x + widthOfText + bead.width,
            //         y + halfBeadHeight,
            //     );
            // }

            for (let col = 0; col < slice[row].length; col++) {
                if (type === ProjectTypeEnum.peyote) yShift = col % 2 ? halfBeadHeight : yShift = 0;
                const x = col * bead.width + builder.SIZES.MARGIN_LEFT + xShift;
                const y = row * bead.height + builder.SIZES.MARGIN_TOP + yShift;
                const color = slice[row][col].filled ? slice[row][col].color : backgroundColor;
                builder.drawBead(x, y, bead.width, bead.height, color);
                if (slice[row][col].filled) builder.writeBeadColorNumber(x, y, bead.width, bead.height, slice[row][col].number.toString(), color);
            }
        }
    }
}

function getScaledBeadsSize(type: ProjectTypeEnum): Bead {
    const scaleFactor = 0.5;
    return {
        width: BeadSettings[type].width * scaleFactor,
        height: BeadSettings[type].height * scaleFactor,
    };
}

function cutSchemaIntoSlices(schema: SchemaItem[][], bead: Bead, rowsPerSlice: number, colsPerSlice: number) {
    const rows = schema.length;
    const cols = Math.max(schema[0].length, schema[1].length);

    const slices: SchemaItem[][][] = [];
    let totalRows = 0;
    let totalCols = 0;
    for (let i = 0; i < rows; i += rowsPerSlice) {
        totalCols = 0;
        for (let j = 0; j < cols; j += colsPerSlice) {
            slices.push(sliceSchema(schema, bead, i, rowsPerSlice, j, colsPerSlice));
            totalCols++;
        }
        totalRows++;
    }

    return { slices, totalRows, totalCols };
}

function sliceSchema(schema: SchemaItem[][], bead: Bead, currentRow: number, totalRows: number, currentCol: number, totalCols: number) {
    return schema
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
