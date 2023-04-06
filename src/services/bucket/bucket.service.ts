import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { randomUUID } from 'crypto';
import { Transaction } from 'sequelize';
import { FileTypes } from 'src/database/file_types';
import { File } from 'src/database/models/file.model';

@Injectable()
export class BucketService {
    constructor(
        @InjectModel(File)
        private readonly fileModel: typeof File,
    ) { }

    async prepareJPGFile(userId: ID, transaction?: Transaction): Promise<File> {
        return await this.fileModel.create({ type: FileTypes.jpg, name: randomUUID(), userId }, { transaction });
    }

    async destroyFile(fileId: ID, transaction?: Transaction): Promise<void> {
        await this.fileModel.destroy({ where: { id: fileId }, transaction });
    }
}
