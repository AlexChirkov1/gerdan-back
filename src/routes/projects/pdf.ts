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
    const totalPages = ~~(schema.length / beadsRowsPerPage);
    let xShift = 0;
    let yShift = 0;
    const pageNumber = 0;

    // const totalWidthInPixels = Math.max(schema[0].length, schema[1].length) * bead.width;
    // const totalHeightInPixels = schema.length * bead.height;
    // const chunkPagesCount = Math.ceil(pdfDocument.getPrintHeight() / bead.height) * bead.height;
    // const chunkSlicesCount = Math.ceil(totalWidthInPixels / (pdfDocument.WIDTH - pdfDocument.MARGIN_LEFT - pdfDocument.MARGIN_RIGHT)) * bead.width;
    console.log({
        beadHeight: bead.height,
        beadsColsPerPage,
        beadsRowsPerPage,
        // chunkPagesCount,
        // chunkSlicesCount,
        // totalHeightInPixels,
        // PRINT_HEIGHT: pdfDocument.getPrintHeight(),
        // beadHeightCount: (totalHeightInPixels / pdfDocument.getPrintHeight()) * bead.height
    });
    const { pages, totalRows, totalCols } = cutSchemaIntoPages(schema, bead, beadsRowsPerPage, beadsColsPerPage);
    // const maxColsCount = calculateColumnsCountPerPage(schema, beadsColsPerPage);

    let i = 0;
    let colsCounter = 0;
    let rowsCounter = 1;
    for (const page of pages) {
        // const leftOffset = calculateLeftOffset(page, bead.width);
        // const topOffset = calculateTopOffset(page, bead.height);
        for (let y = 0; y < page.length; y++) {
            if (!(y % beadsRowsPerPage)) {
                doc.addPage();
                if (colsCounter >= totalCols) {
                    colsCounter = 0;
                    rowsCounter++;
                }
                doc.fontSize(pdfOptions.SITE_MARK_FONT)
                    .fillColor(pdfOptions.BLACK_COLOR)
                    .text(`Сторінка: ${++i}/${pages.length}, Колонка: ${++colsCounter}/${totalCols}, Рядок: ${rowsCounter}/${totalRows}`,
                        100,
                        800
                    );
            }
            if (type === ProjectTypeEnum.brick) xShift = y % 2 ? bead.width / 2 : 0;
            for (let x = 0; x < page[y].length; x++) {
                if (type === ProjectTypeEnum.peyote) yShift = x % 2 ? bead.height / 2 : yShift = 0;
                const xPosition = x * bead.width;
                const yPosition = y * bead.height;
                const color = page[y][x].filled ? page[y][x].color : backgroundColor;
                doc
                    .lineWidth(0.5)
                    .rect(
                        pdfDocument.MARGIN_LEFT + xPosition + xShift,
                        pdfDocument.MARGIN_TOP + yPosition + yShift,
                        bead.width,
                        bead.height
                    )
                    .fillAndStroke(color, pdfOptions.BLACK_COLOR);
            }
        }
    }
}

function calculateRowsCountPerPage(schema: SchemaItem[][], height: number) {
    const rows = schema.length;
    let count = 0;
    for (let i = 0; i < rows; i += height) {
        count++;
    }
    return count;
}

function calculateColumnsCountPerPage(schema: SchemaItem[][], width: number) {
    const cols = Math.max(schema[0].length, schema[1].length);
    let count = 0;
    for (let j = 0; j < cols; j += width) {
        count++;
    }
    return count;
}

function cutSchemaIntoPages(schema: SchemaItem[][], bead: ProjectTypeSetting, height: number, width: number) {
    const rows = schema.length;
    const cols = Math.max(schema[0].length, schema[1].length);

    const submatrices = [];
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

function calculateLeftOffset(schema: SchemaItem[][], width: number): number {
    const beadsInRow = Math.max(schema[0].length, schema[1].length);
    let offset = (pdfDocument.WIDTH - beadsInRow * width) / 2;
    if (offset >= pdfDocument.MARGIN_LEFT) offset = pdfDocument.MARGIN_LEFT;
    return offset;
}

function calculateTopOffset(schema: SchemaItem[][], height: number): number {
    let offset = (pdfDocument.HEIGHT - schema.length * height) / 2;
    if (offset <= pdfDocument.MARGIN_TOP) offset = pdfDocument.MARGIN_TOP;
    return offset;
}

function getBeadsSize(schema: SchemaItem[][], type: ProjectTypeEnum): ProjectTypeSetting {
    const scaleFactor = calculateScaleBetweenOneAndTwo(Math.max(schema[0].length, schema[1].length), ProjectTypeSettings[type].width);
    return {
        width: ProjectTypeSettings[type].width * scaleFactor,
        height: ProjectTypeSettings[type].height * scaleFactor,
    };
}

function addNewPage(doc: Doc, options: { currentPage: number; totalPages: number; }) {
    doc
        .addPage()
        .fontSize(pdfOptions.SITE_MARK_FONT)
        .fillColor(pdfOptions.BLACK_COLOR)
        .text(`${options.currentPage + 1} / ${options.totalPages + 1}`,
            500,
            800
        );
}

function addInfoPage(doc: Doc, options: { username: string, projectName: string; }) {
    const fromSite = `Зроблено на сайті ${process.env.SITE_MARK}`;
    const siteURL = process.env.SITE_URL;
    const byUser = `Автор: @${options.username}`;
    const supportUsMessage = `Підтримати проєкт:`;

    doc.addPage()
        .font('Roboto-Medium')
        .fontSize(pdfOptions.TITLE_FONT)
        .text(options.projectName, getCenteredPositionOfText(doc, options.projectName, pdfOptions.TITLE_FONT), 100)
        .font('Roboto-Regular')
        .fontSize(pdfOptions.SUBTITLE_FONT)
        .moveDown()
        .text(byUser, getCenteredPositionOfText(doc, byUser, pdfOptions.SUBTITLE_FONT))
        .moveDown()
        .moveDown()
        .text(fromSite, getCenteredPositionOfText(doc, fromSite, pdfOptions.SUBTITLE_FONT))
        .text(siteURL, getCenteredPositionOfText(doc, siteURL, pdfOptions.SUBTITLE_FONT), null, { link: process.env.SITE_URL, underline: true, oblique: true });

    if (process.env.SUPPORT_US_URL && process.env.SUPPORT_US_URL !== '') {
        doc
            .moveDown()
            .text(supportUsMessage, getCenteredPositionOfText(doc, supportUsMessage, pdfOptions.SUBTITLE_FONT))
            .text(process.env.SUPPORT_US_URL, getCenteredPositionOfText(doc, process.env.SUPPORT_US_URL, pdfOptions.SUBTITLE_FONT), null, { link: process.env.SUPPORT_US_URL, underline: true, oblique: true });
    }

    addSiteMark(doc);
}

function addSiteMark(doc: Doc) {
    const siteMark = process.env.SITE_MARK as string;
    const textPosition = getCenteredPositionOfText(doc, siteMark, pdfOptions.SITE_MARK_FONT);

    doc
        .fontSize(pdfOptions.SITE_MARK_FONT)
        .fillColor(pdfOptions.BLACK_COLOR)
        .text(siteMark, textPosition, 800);
}

function getCenteredPositionOfText(doc: Doc, text: string, fontSize: number) {
    return (pdfDocument.WIDTH / 2 - doc.fontSize(fontSize).widthOfString(text) / 2);
}
