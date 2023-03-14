import { createWriteStream } from 'fs';
import * as PDFDocument from 'pdfkit';
import { Project, ProjectTypeEnum } from 'src/database/models/project.model';
import { FileStorageHelper } from 'src/utils/file_storage.helper';
import { FontLoader } from 'src/utils/font_loader';
import { SchemaItem } from './dtos/input_types';
import { ProjectTypeSettings } from './resources/project_type_settings';

type Doc = typeof PDFDocument;

const pdfOptions = {
    TITLE_FONT: 24,
    SUBTITLE_FONT: 16,
    SITE_MARK_FONT: 16,
    BLACK_COLOR: '#000000',
    WHITE_COLOR: '#ffffff',
};

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

    // return await FileStorageHelper.extractFile(filePath);
}

function addSchemaPage(doc: Doc, schema: SchemaItem[][], type: ProjectTypeEnum, backgroundColor: string) {
    const width = Math.max(schema[0].length, schema[1].length);
    const height = schema.length;
    const bead = {
        width: ProjectTypeSettings[type].width,
        height: ProjectTypeSettings[type].height,
    };

    for (let y = 0; y < schema.length; y++) {
        for (let x = 0; x < schema[y].length; x++) {
            const xPosition = x * bead.width;
            const yPosition = y * bead.height;
            const color = schema[y][x].filled ? schema[y][x].color : backgroundColor;
            doc.rect(xPosition, yPosition, bead.width, bead.height)
                .fillAndStroke(color, pdfOptions.BLACK_COLOR);
        }
    }
}

function addInfoPage(doc: Doc, options: { username: string, projectName: string; }) {
    const fromSite = `Зроблено на сайті ${process.env.SITE_MARK}`;
    const siteURL = process.env.SITE_URL;
    const byUser = `Автор: @${options.username}`;
    const supportUsMessage = `Підтримати проєкт:`;

    doc.addPage()
        .font('Roboto-Medium')
        .fontSize(pdfOptions.TITLE_FONT)
        .text(options.projectName, this.centeredPositionOfText(options.projectName, pdfOptions.TITLE_FONT), 100)
        .font('Roboto-Regular')
        .fontSize(pdfOptions.SUBTITLE_FONT)
        .moveDown()
        .text(byUser, this.centeredPositionOfText(byUser, pdfOptions.SUBTITLE_FONT))
        .moveDown()
        .moveDown()
        .text(fromSite, this.centeredPositionOfText(fromSite, pdfOptions.SUBTITLE_FONT))
        .text(siteURL, this.centeredPositionOfText(siteURL, pdfOptions.SUBTITLE_FONT), null, { link: process.env.SITE_URL, underline: true, oblique: true });

    if (process.env.SUPPORT_US_URL && process.env.SUPPORT_US_URL !== '') {
        doc.moveDown()
            .text(supportUsMessage, this.centeredPositionOfText(supportUsMessage, pdfOptions.SUBTITLE_FONT))
            .text(process.env.SUPPORT_US_URL, this.centeredPositionOfText(process.env.SUPPORT_US_URL, pdfOptions.SUBTITLE_FONT), null, { link: process.env.SUPPORT_US_URL, underline: true, oblique: true });
    }

    addSiteMark(doc);
}

function addSiteMark(doc: Doc) {
    const siteMark = process.env.SITE_MARK as string;
    const textPosition = this.centeredPositionOfText(siteMark, this.FONT_SIZE);

    doc
        .fontSize(pdfOptions.SITE_MARK_FONT)
        .fillColor(pdfOptions.BLACK_COLOR)
        .text(siteMark,
            textPosition,
            800
        );
}
