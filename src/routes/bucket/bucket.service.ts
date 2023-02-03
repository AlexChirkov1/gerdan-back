import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { randomUUID } from 'crypto';
import { unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';
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
        const path = join(cwd(), 'database', 'bucket', `${randomUUID()}.${type}`);
        const file = await this.fileModel.create({
            path,
            type: FileTypes[type],
        }, { transaction });
        await writeFile(path, data);
        return file;
    }

    async destroyFile(fileId: ID, transaction?: Transaction): Promise<void> {
        const file = await this.fileModel.findByPk(fileId, { transaction });
        if (!file) return;
        await unlink(file.path);
        await file.destroy({ transaction });
    }
}
