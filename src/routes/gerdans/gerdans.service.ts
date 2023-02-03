import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Gerdan } from 'src/database/models/gerdan.model';
import { Pixel } from 'src/database/models/pixel.model';
import { GerdanInput } from './api/gerdan.input';
import { PixelInput } from './api/pixel.input';

type ColorStatics = { index: number, color: string, count: number; }[];
type Statistics = {
    rows: number,
    columns: number,
    totalBeads: 0,
    colors: ColorStatics;
};

@Injectable()
export class GerdansService {
    constructor(
        @InjectModel(Gerdan)
        private readonly gerdanModel: typeof Gerdan,
        @InjectModel(Pixel)
        private readonly pixelModel: typeof Pixel,
    ) { }

    async create(gerdanInput: GerdanInput, userId: ID, transaction?: Transaction): Promise<Gerdan> {
        const gerdan = await this.createGerdan(gerdanInput, userId, transaction);
        await this.addPixels(gerdanInput.pixels, gerdan.id, transaction);
        return gerdan;
    }

    collectStatistics(gerdanInput: GerdanInput): Statistics {
        const ONE = 1;
        const colorSet: Set<string> = new Set();
        const countMap: Map<string, number> = new Map();
        const indexMap: Map<string, number> = new Map();
        const statistics: Statistics = {
            rows: gerdanInput.width / gerdanInput.pixelSize,
            columns: gerdanInput.height / gerdanInput.pixelSize,
            totalBeads: 0,
            colors: []
        };

        for (const pixel of gerdanInput.pixels) {
            countMap.set(pixel.color, countMap.has(pixel.color) ? countMap.get(pixel.color) + ONE : ONE);
            if (!colorSet.has(pixel.color)) colorSet.add(pixel.color);
            if (!indexMap.has(pixel.color)) indexMap.set(pixel.color, pixel.index);
        }

        for (const [, count] of countMap) {
            statistics.totalBeads += count;
        }

        for (const color of colorSet) {
            statistics.colors.push({
                color,
                index: indexMap.get(color),
                count: countMap.get(color),
            });
        }

        statistics.colors.sort((first, second) => first.count - second.count);

        return statistics;
    }

    async update(gerdan: Gerdan, gerdanInput: GerdanInput, transaction?: Transaction): Promise<void> {
        await this.updateGerdan(gerdan, gerdanInput, transaction);
        await this.dropPixels(gerdan.id, transaction);
        await this.addPixels(gerdanInput.pixels, gerdan.id, transaction);
    }

    async createGerdan(gerdanInput: GerdanInput, userId: ID, transaction?: Transaction): Promise<Gerdan> {
        return await this.gerdanModel.create({ ...gerdanInput, userId }, { transaction });
    }

    async updateGerdan(gerdan: Gerdan, gerdanInput: GerdanInput, transaction?: Transaction): Promise<void> {
        await gerdan.update(gerdanInput, { transaction });
    }

    async addPixels(pixels: PixelInput[], gerdanId: ID, transaction?: Transaction): Promise<void> {
        const actionsData = pixels.map((pixel) => ({ ...pixel, gerdanId }));
        await this.pixelModel.bulkCreate(actionsData, { transaction });
    }

    async dropPixels(gerdanId: ID, transaction?: Transaction): Promise<void> {
        await this.pixelModel.destroy({ where: { gerdanId }, transaction });
    }

    async getRawPixels(gerdanId: ID, transaction?: Transaction): Promise<Pixel[]> {
        return await this.pixelModel.findAll({ where: { gerdanId }, transaction, mapToModel: false, raw: true });
    }

    async getGerdanByIdForUser(gerdanId: ID, userId: ID, transaction?: Transaction): Promise<Gerdan> {
        return await this.gerdanModel.findOne({ where: { id: gerdanId, userId }, transaction });
    }

    async getDetails(gerdanId: ID, transaction?: Transaction): Promise<Gerdan> {
        const gerdan = await this.gerdanModel.scope(['withAuthor', 'withPreview']).findByPk(gerdanId, { transaction });
        gerdan.pixels = await this.getRawPixels(gerdan.id, transaction);
        return gerdan;
    }

    async countGerdansForUser(userId: ID, transaction?: Transaction): Promise<number> {
        return await this.gerdanModel.scope([{ method: ['byAuthorId', userId] }]).count({ transaction });
    }

    async getGerdansForUser(records: number, userId: ID, id?: ID, transaction?: Transaction): Promise<Gerdan[]> {
        return await this.gerdanModel.scope([
            'withAuthor',
            'withPreview',
            { method: ['byAuthorId', userId] },
            { method: ['pagination', records, id] }
        ]).findAll({ transaction, subQuery: false });
    }

    async getCursors(records: number, id: ID, transaction?: Transaction): Promise<{ prev: ID | null, next: ID | null; }> {
        const prev = await this.getPrevCursor(records, id, transaction);
        const next = await this.getNextCursor(records, id, transaction);
        return { prev, next };
    }

    async getPrevCursor(records: number, id: ID, transaction?: Transaction): Promise<ID | null> {
        const gerdan = await this.gerdanModel.scope([{ method: ['prevCursor', records, id] }]).findOne({ transaction });
        return gerdan?.id;
    }

    async getNextCursor(records: number, id: ID, transaction?: Transaction): Promise<ID | null> {
        const gerdan = await this.gerdanModel.scope([{ method: ['nextCursor', records, id] }]).findOne({ transaction });
        return gerdan?.id;
    }
}
