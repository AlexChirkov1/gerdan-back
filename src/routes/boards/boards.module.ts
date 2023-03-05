import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Board } from 'src/database/models/board.model';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';

@Module({
    imports: [SequelizeModule.forFeature([Board])],
    controllers: [BoardsController],
    providers: [BoardsService]
})
export class BoardsModule { }
