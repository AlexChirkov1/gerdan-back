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
    MARGIN_LEFT: 60,
    MARGIN_TOP: 58,
    MARGIN_RIGHT: 55.28,
    MARGIN_BOTTOM: 57.89,
    PRINT_WIDTH: 480, // width - marginLeft - marginRight,
    PRINT_HEIGHT: 726, // height - marginTop - marginBottom,
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
    const bead = getBeadsSize(type);
    const beadsPerPage = ~~(pdfDocument.PRINT_HEIGHT / bead.height);
    const totalPages = ~~(schema.length / beadsPerPage);
    const leftOffset = calculateLeftOffset(schema, bead.width);
    const topOffset = calculateTopOffset(schema, bead.height);
    let xShift = 0;
    let yShift = 0;
    let page = 0;
    for (let y = 0; y < schema.length; y++) {
        if (!(y % beadsPerPage)) addNewPage(doc, { currentPage: page++, totalPages });
        if (type === ProjectTypeEnum.brick) xShift = y % 2 ? bead.width / 2 : xShift = 0;
        for (let x = 0; x < schema[y].length; x++) {
            if (type === ProjectTypeEnum.peyote) yShift = x % 2 ? bead.height / 2 : yShift = 0;
            const xPosition = x * bead.width;
            const yPosition = y * bead.height;
            const color = schema[y][x].filled ? schema[y][x].color : backgroundColor;
            doc
                .rect(
                    leftOffset + xPosition + xShift,
                    topOffset + yPosition + yShift,
                    bead.width,
                    bead.height
                )
                .fillAndStroke(color, pdfOptions.BLACK_COLOR);
        }
    }
}

function calculateLeftOffset(schema: SchemaItem[][], width: number): number {
    const beadsInRow = Math.max(schema[0].length, schema[1].length);
    let offset = (pdfDocument.WIDTH - beadsInRow * width) / 2;
    if (offset <= pdfDocument.MARGIN_LEFT) offset = pdfDocument.MARGIN_LEFT;
    return offset;
}

function calculateTopOffset(schema: SchemaItem[][], height: number): number {
    let offset = (pdfDocument.HEIGHT - schema.length * height) / 2;
    if (offset <= pdfDocument.MARGIN_TOP) offset = pdfDocument.MARGIN_TOP;
    return offset;
}

function getBeadsSize(type: ProjectTypeEnum): ProjectTypeSetting {
    return {
        width: ProjectTypeSettings[type].width,
        height: ProjectTypeSettings[type].height,
    };
}

function addNewPage(doc: Doc, options: { currentPage: number; totalPages: number; }) {
    doc.addPage()
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
