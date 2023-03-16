import { createWriteStream } from 'fs';
import * as PDFDocument from 'pdfkit';
import { Project, ProjectTypeEnum } from 'src/database/models/project.model';
import { FileStorageHelper } from 'src/utils/file_storage.helper';
import { FontLoader } from 'src/utils/font_loader';
import { SchemaItem } from './dtos/input_types';
import { ProjectTypeSetting, ProjectTypeSettings } from './resources/project_type_settings';

type Doc = typeof PDFDocument;

const pdfOptions = {
    TITLE_FONT: 24,
    SUBTITLE_FONT: 16,
    SITE_MARK_FONT: 16,
    BLACK_COLOR: '#000000',
    WHITE_COLOR: '#ffffff',
    GRAY_COLOR: '#808080',
    PAGE_NUMBER_FONT: 10,
};

const pdfDocument = {
    WIDTH: 595.28,
    HEIGHT: 841.89,
    MARGIN_LEFT: 75.6, // 60
    MARGIN_TOP: 37.8, // 58
    MARGIN_RIGHT: 37.8, // 55.28
    MARGIN_BOTTOM: 37.8, // 57.89
    getPrintWidth: () => pdfDocument.WIDTH - pdfDocument.MARGIN_LEFT - pdfDocument.MARGIN_RIGHT,
    getPrintHeight: () => pdfDocument.HEIGHT - pdfDocument.MARGIN_TOP - pdfDocument.MARGIN_BOTTOM,
} as const;

export async function createPDF(project: Project): Promise<void> {
    const filePath = FileStorageHelper.prepareFilePathToTempFolder(`${project.author.username}-${project.name}`, 'pdf');

    const doc = new PDFDocument({
        size: 'A4',
        autoFirstPage: false,
        margin: 0,
        layout: 'portrait',
        info: {
            Title: project.name,
            Author: project.author.username
        },
        pdfVersion: '1.7',
    });

    doc
        .registerFont('Roboto-Regular', FontLoader.getRobotoRegular())
        .registerFont('Roboto-Medium', FontLoader.getRobotoMedium())
        .font('Roboto-Regular')
        .pipe(createWriteStream(filePath));

    addInfoPage(doc, { username: project.author.username, projectName: project.name });
    addSchemaPage(doc, JSON.parse(project.schema), project.type, project.backgroundColor);

    doc.end();
    // return await FileStorageHelper.extractFile(filePath);
}

function addSchemaPage(doc: Doc, schema: SchemaItem[][], type: ProjectTypeEnum, backgroundColor: string) {
    const bead = getBeadsSize(schema, type);
    const beadsRowsPerPage = ~~(pdfDocument.getPrintHeight() / bead.height);
    const beadsColsPerPage = ~~(pdfDocument.getPrintWidth() / bead.width);
    let xShift = 0;
    let yShift = 0;
    const { pages, totalRows, totalCols } = cutSchemaIntoPages(schema, bead, beadsRowsPerPage, beadsColsPerPage);

    let pageCounter = 0;
    let colsCounter = 0;
    let rowsCounter = 1;
    for (const page of pages) {
        for (let y = 0; y < page.length; y++) {
            if (!(y % beadsRowsPerPage)) {
                if (colsCounter >= totalCols) {
                    colsCounter = 0;
                    rowsCounter++;
                }
                createNewSchemaPageWithInfo(doc, {
                    rowsCounter,
                    totalRows,
                    colsCounter: ++colsCounter,
                    totalCols,
                    pageCounter: ++pageCounter,
                });
            }
            if (type === ProjectTypeEnum.brick) xShift = y % 2 ? bead.width / 2 : 0;
            for (let x = 0; x < page[y].length; x++) {
                if (type === ProjectTypeEnum.peyote) yShift = x % 2 ? bead.height / 2 : yShift = 0;
                const xPosition = x * bead.width + pdfDocument.MARGIN_LEFT + xShift;
                const yPosition = y * bead.height + pdfDocument.MARGIN_TOP + yShift;
                const color = page[y][x].filled ? page[y][x].color : backgroundColor;
                const lineWidth = 0.5;
                doc
                    .lineWidth(lineWidth)
                    .rect(
                        xPosition,
                        yPosition,
                        bead.width - lineWidth,
                        bead.height - lineWidth
                    )
                    .fillAndStroke(color, convertToBlackOrWhite(color, { black: '#3B3B3B', white: '#AEAEAE' }));

                if (page[y][x].filled) {
                    const number = page[y][x].number.toString();
                    const numberPositionX = xPosition + getCenteredPositionOfText(doc, number, pdfOptions.PAGE_NUMBER_FONT, bead.width);
                    const numberPositionY = yPosition + getMiddledPositionOfText(doc, number, pdfOptions.PAGE_NUMBER_FONT, bead.height);

                    doc
                        .fontSize(pdfOptions.PAGE_NUMBER_FONT)
                        .fillColor(convertToBlackOrWhite(color))
                        .text(
                            number,
                            numberPositionX,
                            numberPositionY,
                            { lineBreak: false, }
                        );
                }
            }
        }
    }
}

function createNewSchemaPageWithInfo(doc: Doc, options) {
    let text = `Частина: ${options.rowsCounter}/${options.totalRows}`;
    if (options.totalCols) text += `, Сторінка: ${options.colsCounter}/${options.totalCols}`;

    doc
        .addPage()
        .fontSize(pdfOptions.PAGE_NUMBER_FONT)
        .fillColor(pdfOptions.BLACK_COLOR)
        .text(text,
            pdfDocument.MARGIN_LEFT,
            pdfDocument.HEIGHT - pdfDocument.MARGIN_BOTTOM
        )
        .fontSize(pdfOptions.PAGE_NUMBER_FONT)
        .fillColor(pdfOptions.GRAY_COLOR)
        .text(`${options.pageCounter}`,
            pdfDocument.WIDTH - pdfDocument.MARGIN_RIGHT,
            pdfDocument.HEIGHT - pdfDocument.MARGIN_BOTTOM
        );

    addSiteMark(doc);
}

function cutSchemaIntoPages(schema: SchemaItem[][], bead: ProjectTypeSetting, height: number, width: number) {
    const rows = schema.length;
    const cols = Math.max(schema[0].length, schema[1].length);

    const submatrices: SchemaItem[][][] = [];
    let pageNumber = 0;
    let sliceNumber = 0;
    for (let i = 0; i < rows; i += height) {
        sliceNumber = 0;
        for (let j = 0; j < cols; j += width) {
            const submatrix = schema
                .slice(i, i + height)
                .map(row => row
                    .slice(j, j + width)
                    .map(slice => ({
                        ...slice,
                        x: slice.x - sliceNumber * bead.width,
                        y: slice.y - pageNumber * bead.height,
                    }))
                );
            submatrices.push(submatrix);
            sliceNumber++;
        }
        pageNumber++;
    }

    return {
        pages: submatrices,
        totalRows: pageNumber,
        totalCols: sliceNumber,
    };
}

function calculateScaleBetweenOneAndTwo(columnsCount: number, beadWidth: number, scale = 10): number {
    if (scale === 20) return 0.5;
    const rowLength = columnsCount * beadWidth / (scale / 10);
    if (rowLength > pdfDocument.getPrintWidth()) return calculateScaleBetweenOneAndTwo(columnsCount, beadWidth, scale + 1);
    else return 1 / (scale / 10);
}

function getBeadsSize(schema: SchemaItem[][], type: ProjectTypeEnum): ProjectTypeSetting {
    const scaleFactor = calculateScaleBetweenOneAndTwo(Math.max(schema[0].length, schema[1].length), ProjectTypeSettings[type].width);
    return {
        width: ProjectTypeSettings[type].width * scaleFactor,
        height: ProjectTypeSettings[type].height * scaleFactor,
    };
}

function addInfoPage(doc: Doc, options: { username: string, projectName: string; }) {
    const fromSite = `Зроблено на сайті ${process.env.SITE_MARK}`;
    const siteURL = process.env.SITE_URL;
    const byUser = `Автор: @${options.username}`;
    const supportUsMessage = `Підтримати проєкт:`;

    doc.addPage()
        .font('Roboto-Medium')
        .fontSize(pdfOptions.TITLE_FONT)
        .text(options.projectName, getCenteredPositionOfText(doc, options.projectName, pdfOptions.TITLE_FONT, pdfDocument.WIDTH), 100)
        .font('Roboto-Regular')
        .fontSize(pdfOptions.SUBTITLE_FONT)
        .moveDown()
        .text(byUser, getCenteredPositionOfText(doc, byUser, pdfOptions.SUBTITLE_FONT, pdfDocument.WIDTH))
        .moveDown()
        .moveDown()
        .text(fromSite, getCenteredPositionOfText(doc, fromSite, pdfOptions.SUBTITLE_FONT, pdfDocument.WIDTH))
        .text(siteURL, getCenteredPositionOfText(doc, siteURL, pdfOptions.SUBTITLE_FONT, pdfDocument.WIDTH), null, { link: process.env.SITE_URL, underline: true, oblique: true });

    if (process.env.SUPPORT_US_URL && process.env.SUPPORT_US_URL !== '') {
        doc
            .moveDown()
            .text(supportUsMessage, getCenteredPositionOfText(doc, supportUsMessage, pdfOptions.SUBTITLE_FONT, pdfDocument.WIDTH))
            .text(process.env.SUPPORT_US_URL, getCenteredPositionOfText(doc, process.env.SUPPORT_US_URL, pdfOptions.SUBTITLE_FONT, pdfDocument.WIDTH), null, { link: process.env.SUPPORT_US_URL, underline: true, oblique: true });
    }

    addSiteMark(doc);
}

function addSiteMark(doc: Doc) {
    const siteMark = process.env.SITE_MARK as string;
    const textPosition = getCenteredPositionOfText(doc, siteMark, pdfOptions.SITE_MARK_FONT, pdfDocument.WIDTH);

    doc
        .fontSize(pdfOptions.SITE_MARK_FONT)
        .fillColor(pdfOptions.BLACK_COLOR)
        .text(siteMark, textPosition, pdfDocument.HEIGHT - pdfDocument.MARGIN_BOTTOM);
}

function getCenteredPositionOfText(doc: Doc, text: string, fontSize: number, width: number) {
    return width / 2 - doc.fontSize(fontSize).widthOfString(text) / 2;
}

function getMiddledPositionOfText(doc: Doc, text: string, fontSize: number, height: number) {
    return height / 2 - doc.fontSize(fontSize).heightOfString(text) / 2;
}

function convertToBlackOrWhite(hex: string, options = { black: '#000000', white: '#FFFFFF' }): string {
    const redNumber = parseInt(hex.slice(1, 3), 16),
        greenNumber = parseInt(hex.slice(3, 5), 16),
        blueNumber = parseInt(hex.slice(5, 7), 16);
    return redNumber * 0.299 + greenNumber * 0.587 + blueNumber * 0.114 > 186 ? options.black : options.white;
}
