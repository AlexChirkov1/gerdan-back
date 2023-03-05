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



@Injectable()
export class BoardsService {
    constructor(
        @InjectModel(Board)
        private readonly boardModel: typeof Board
    ) { }

    async createBoard(metadata: BoardMetadata, transaction: Transaction): Promise<Board> {
        return await this.boardModel.create(metadata, { transaction });
    }
}
