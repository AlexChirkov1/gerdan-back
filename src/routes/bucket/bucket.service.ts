import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { FileTypes } from 'src/database/file_types';
import { File } from 'src/database/models/file.model';

@Injectable()
export class BucketService {
    constructor(
        @InjectModel(File)
        private readonly fileModel: typeof File,
    ) { }

    async getFileById(id: string): Promise<File> {
        return await this.fileModel.findByPk(id);
    }

    async saveFile(data: Buffer, type: FileTypes, transaction?: Transaction): Promise<File> {
        return await this.fileModel.create({ blob: data, type: FileTypes[type], }, { transaction });
    }

    async updateFile(fileId: ID, data: Buffer, transaction?: Transaction): Promise<void> {
        const file = await this.fileModel.findByPk(fileId, { transaction });
        await file.update({ blob: data }, { transaction });
    }

    async destroyFile(fileId: ID, transaction?: Transaction): Promise<void> {
        const file = await this.fileModel.findByPk(fileId, { transaction });
        await file.destroy({ transaction });
    }

    async countFiles(transaction?: Transaction): Promise<number> {
        return await this.fileModel.count({ transaction });
    }

    async getFilesList(limit: number, offset: number, transaction?: Transaction): Promise<File[]> {
        return await this.fileModel.scope([{ method: ['offsetPagination', limit, offset] }]).findAll({ transaction });
    }
}
