import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Board } from 'src/database/models/board.model';

type BoardMetadata = {
    userId: ID;
    name: string;
    type: number;
    backgroundColor?: string;
};

type BoardSchemaData = {
    type: number;
    backgroundColor?: string;
    schema: string;
    colormap: string;
};

@Injectable()
export class BoardsService {
    constructor(
        @InjectModel(Board)
        private readonly boardModel: typeof Board
    ) { }

    async createBoard(metadata: BoardMetadata, transaction: Transaction): Promise<Board> {
        return await this.boardModel.create(metadata, { transaction });
    }

    async getBoardByIdForUser(id: ID, userId: ID, transaction?: Transaction): Promise<Board> {
        return await this.boardModel.findOne({ where: { id, userId }, transaction });
    }

    async updateSchema(id: ID, boardSchema: BoardSchemaData, transaction?: Transaction): Promise<void> {
        await this.boardModel.update(boardSchema, { where: { id }, transaction });
    }

    async getDetails(id: ID, transaction?: Transaction): Promise<Board> {
        return await this.boardModel.scope([
            'withAuthor',
            'withPreview'
        ]).findByPk(id, { transaction });
    }
}
