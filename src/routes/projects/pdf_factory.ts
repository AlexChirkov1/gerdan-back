import { Project, ProjectTypeEnum, Schema } from 'src/database/models/project.model';
import { FileStorageHelper } from 'src/utils/file_storage.helper';
import { half } from 'src/utils/half';
import { PDFBuilder } from './pdf_builder';
import { Bead, BeadSettings } from './resources/bead';

export class PDFFactory {
    builder: PDFBuilder;
    project: Project;
    filePath: string;
    parsedSchema: Schema;

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
        return await FileStorageHelper.extractFile(this.filePath);
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
            .writeLink(siteURL, siteURL, this.builder.getCenteredPositionOfText(fromSite, this.builder.SIZE.WIDTH));

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
            .setFont(this.builder.FONT.REGULAR)
            .setFontSize(this.builder.FONT_SIZE.SECONDARY)
            .setColor(this.builder.COLOR.BLACK);

        const initialY = 330;
        let x = this.builder.PADDING.LEFT;
        let y = initialY;
        const lineSpacing = bead.height + half(bead.height);
        const beadSpacing = bead.width + half(bead.width);
        const columnSpacing = 200;
        for (const item of statistic) {
            const text = ` — ${item.count} шт.`;
            this.builder
                .drawBead(x, y, item.number)
                .writeText(text, x + beadSpacing, y + this.builder.getMiddledPositionOfText(text, bead.height));

            y += lineSpacing;
            if (y >= this.builder.PADDING.BOTTOM) {
                y = initialY;
                x += columnSpacing;
            }
        }
    }

    private addSiteMark() {
        const siteMark = process.env.SITE_MARK;
        this.builder
            .setFont(this.builder.FONT.REGULAR)
            .setFontSize(this.builder.FONT_SIZE.PRIMARY)
            .setColor(this.builder.COLOR.BLACK)
            .writeText(siteMark, this.builder.getCenteredPositionOfText(siteMark, this.builder.SIZE.WIDTH), this.builder.PADDING.BOTTOM);
    }

    getScaledBead(type: ProjectTypeEnum): Bead {
        const scaleFactor = 0.5;
        return {
            width: BeadSettings[type].width * scaleFactor,
            height: BeadSettings[type].height * scaleFactor,
        };
    }
}
