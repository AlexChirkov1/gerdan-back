import { Body, Controller, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Transaction } from 'sequelize';
import { UserSession, UserSessionData } from 'src/auth/decorators/userSession.decorator';
import { Auth } from 'src/auth/guards';
import { Base10Pipe } from 'src/common/base10.pipe';
import { ValidateSchema } from 'src/common/validate.decorator';
import { SequelizeTransaction } from 'src/database/common/transaction.decorator';
import { TransactionInterceptor } from 'src/database/common/transaction.interceptor';
import { BoardTypeEnum } from 'src/database/models/board.model';
import { NotFoundException } from 'src/errors/handlers/not_found.exception';
import { ERROR_MESSAGES } from 'src/errors/messages';
import { BoardMetadataInput } from './api/board_metadata.input';
import { BoardMetadataOutput } from './api/board_metadata.output';
import { BoardSchemaInput } from './api/board_schema.input';
import { BoardSchemaOutput } from './api/board_schema.output';
import { BoardsService } from './boards.service';
import { BoardMetadataDto } from './dtos/board_metadata.dto';
import { BoardSchemaDto } from './dtos/board_schema.dto';
import { BoardSchema } from './schemas/board.schema';
import { BoardMetadataSchema } from './schemas/board_metadata.schema';

@ApiTags('boards')
@Controller('boards')
@UseInterceptors(TransactionInterceptor)
export class BoardsController {
    constructor(private readonly boardsService: BoardsService) { }

    @Post()
    @Auth()
    @ApiOperation({ summary: 'Create a new board' })
    @ApiCreatedResponse({ type: () => BoardMetadataOutput })
    @ValidateSchema(BoardMetadataSchema)
    async createNewBoard(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Body() body: BoardMetadataInput,
    ): Promise<BoardMetadataDto> {
        const board = await this.boardsService.createBoard({
            name: body.name,
            type: BoardTypeEnum[body.type],
            backgroundColor: body.backgroundColor,
            userId: session.userId
        }, transaction);

        return new BoardMetadataDto(board);
    }

    @Put(':id')
    @Auth()
    @ApiOperation({ summary: 'Update board schema' })
    @ApiCreatedResponse({ type: () => BoardSchemaOutput })
    @ValidateSchema(BoardSchema)
    async updateSchema(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Param('id', Base10Pipe) id: string,
        @Body() body: BoardSchemaInput
    ) {
        let board = await this.boardsService.getBoardByIdForUser(id, session.userId, transaction);
        if (!board) throw new NotFoundException(ERROR_MESSAGES.BOARDS.not_found);
        await this.boardsService.updateSchema(board.id, {
            type: body.type ? BoardTypeEnum[body.type] : board.type,
            backgroundColor: body.backgroundColor ?? board.backgroundColor,
            schema: JSON.stringify(body.schema),
            colormap: JSON.stringify(body.colormap),
        }, transaction);
        // TODO: async create preview
        // async save preview on bucket
        board = await this.boardsService.getBoardByIdForUser(id, session.userId, transaction);
        return new BoardSchemaDto(board);
    }
}
