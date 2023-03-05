import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Transaction } from 'sequelize';
import { UserSession, UserSessionData } from 'src/auth/decorators/userSession.decorator';
import { Auth } from 'src/auth/guards';
import { ValidateSchema } from 'src/common/validate.decorator';
import { SequelizeTransaction } from 'src/database/common/transaction.decorator';
import { BoardTypeEnum } from 'src/database/models/board.model';
import { BoardMetadataInput } from './api/board_metadata.input';
import { BoardMetadataOutput } from './api/board_metadata.output';
import { BoardsService } from './boards.service';
import { BoardMetadataDto } from './dtos/board.dto';
import { BoardMetadataSchema } from './schemas/board_metadata.schema';

@ApiTags('boards')
@Controller('boards')
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
}
