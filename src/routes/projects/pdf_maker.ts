import { Project, ProjectTypeEnum, Schema } from 'src/database/models/project.model';
import { FileStorageHelper } from 'src/utils/file_storage.helper';
import { half } from 'src/utils/half';
import { SchemaItem } from './dtos/input_types';
import { ProjectPDFBuilder } from './project_pdf_builder';
import { BeadSetting, ProjectTypeSettings } from './resources/project_type_settings';

export async function makePdfDocument(project: Project) {
    const builder = new ProjectPDFBuilder(project.name, project.author.username);
    const filePath = FileStorageHelper.prepareFilePathToTempFolder(`${project.author.username}-${project.name}`, 'pdf');
    builder.pipeTo(filePath);
    builder.addInfoPage(project.name, project.author.username);

    const parsedSchema: Schema = JSON.parse(project.schema);
    builder.addStatistics(parsedSchema);

    const bead = getScaledBeadsSize(project.type);
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
            if (project.type === ProjectTypeEnum.brick) xShift = row % 2 ? halfBeadWidth : 0;

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
                if (project.type === ProjectTypeEnum.peyote) yShift = col % 2 ? halfBeadHeight : yShift = 0;
                const x = col * bead.width + builder.SIZES.MARGIN_LEFT + xShift;
                const y = row * bead.height + builder.SIZES.MARGIN_TOP + yShift;
                const color = slice[row][col].filled ? slice[row][col].color : project.backgroundColor;
                builder.drawBead(x, y, bead.width, bead.height, color);
                if (slice[row][col].filled) builder.writeBeadColorNumber(x, y, bead.width, bead.height, slice[row][col].number.toString(), color);
            }
        }
    }
    builder.endPipe();
    return await FileStorageHelper.extractFile(filePath);
}

function getScaledBeadsSize(type: ProjectTypeEnum): BeadSetting {
    const scaleFactor = 0.5;
    return {
        width: ProjectTypeSettings[type].width * scaleFactor,
        height: ProjectTypeSettings[type].height * scaleFactor,
    };
}

function cutSchemaIntoSlices(schema: SchemaItem[][], bead: BeadSetting, rowsPerSlice: number, colsPerSlice: number) {
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

function sliceSchema(schema: SchemaItem[][], bead: BeadSetting, currentRow: number, totalRows: number, currentCol: number, totalCols: number) {
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
