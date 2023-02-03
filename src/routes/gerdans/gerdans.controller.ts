import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query, Res, UseInterceptors } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Transaction } from 'sequelize';
import { UserSession, UserSessionData } from 'src/auth/decorators/userSession.decorator';
import { Auth } from 'src/auth/guards';
import { Base10Pipe } from 'src/common/base10.pipe';
import { CursorPaginationInput } from 'src/common/cursor_pagination.input';
import { CursorPaginationSchema } from 'src/common/cursor_pagination.schema';
import { ERROR_MESSAGES } from 'src/common/error_messages';
import { ValidateSchema } from 'src/common/validate.decorator';
import { SequelizeTransaction } from 'src/database/common/transaction.decorator';
import { TransactionInterceptor } from 'src/database/common/transaction.interceptor';
import { createGerdanPreview, generateGerdanPDF } from 'src/services/gerdan/gerdan';
import { FileStorageHelper } from 'src/utils/file_storage.helper';
import { BucketService } from '../bucket/bucket.service';
import { UsersService } from '../users/users.service';
import { GerdanInput } from './api/gerdan.input';
import { GerdanOutput } from './api/gerdan.output';
import { GerdansOutput } from './api/gerdans.output';
import { GerdanDto } from './dtos/gerdan.dto';
import { GerdansDto } from './dtos/gerdans.dto';
import { GerdansService } from './gerdans.service';
import { GerdanSchema } from './schemas/gerdan.schema';

@ApiTags('gerdans')
@Controller('gerdans')
@UseInterceptors(TransactionInterceptor)
export class GerdansController {
    constructor(
        private readonly gerdansService: GerdansService,
        private readonly usersService: UsersService,
        private readonly bucketService: BucketService,
    ) { }

    @Get()
    @Auth()
    @ApiOperation({ summary: 'Get gerdans' })
    @ApiOkResponse({ type: () => GerdansOutput })
    @ValidateSchema(CursorPaginationSchema)
    async getGerdans(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Query() query: CursorPaginationInput
    ): Promise<GerdansDto> {
        let gerdans = [];
        let cursors = {};
        const totalCount = await this.gerdansService.countGerdansForUser(session.userId, transaction);
        if (totalCount) {
            gerdans = await this.gerdansService.getGerdansForUser(query.records, session.userId, query.id, transaction);
            cursors = await this.gerdansService.getCursors(query.records, gerdans[0].id, transaction);
        }

        return new GerdansDto(gerdans, { totalCount, count: gerdans.length, ...cursors });
    }

    @Get(':id')
    @Auth()
    @ApiOperation({ summary: 'View gerdan schema' })
    @ApiOkResponse({ type: () => GerdanOutput })
    async getGerdan(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Param('id', Base10Pipe) id: string,
    ): Promise<GerdanDto> {
        const existedGerdan = await this.gerdansService.getGerdanByIdForUser(id, session.userId, transaction);
        if (!existedGerdan) throw new NotFoundException(ERROR_MESSAGES.gerdans.not_found);
        const gerdan = await this.gerdansService.getDetails(id, transaction);

        return new GerdanDto(gerdan);
    }

    @Get(':id/pdf')
    @Auth()
    @ApiOperation({ summary: 'Get gerdan in PDF format' })
    async getPDF(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Param('id', Base10Pipe) id: string,
        @Res() res: Response,
    ) {
        const existedGerdan = await this.gerdansService.getGerdanByIdForUser(id, session.userId, transaction);
        if (!existedGerdan) throw new NotFoundException(ERROR_MESSAGES.gerdans.not_found);
        const gerdan = await this.gerdansService.getDetails(id, transaction);
        const user = await this.usersService.findUserById(session.userId, transaction);

        const filePath = FileStorageHelper.prepareFilePathToTempFolder(`${user.username}-${gerdan.name}`, 'pdf');
        generateGerdanPDF(gerdan, user, filePath);
        const file = await FileStorageHelper.extractFile(filePath);
        res.status(201).send(file);
    }

    @Post()
    @Auth()
    @ApiOperation({ summary: 'Create a new gerdan' })
    @ApiCreatedResponse({ type: () => GerdanOutput })
    @ValidateSchema(GerdanSchema)
    async createGerdan(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Body() body: GerdanInput
    ): Promise<GerdanDto> {
        const newGerdan = await this.gerdansService.create(body, session.userId, transaction);
        const gerdan = await this.gerdansService.getDetails(newGerdan.id, transaction);

        if (gerdan?.previewId) await this.bucketService.destroyFile(gerdan.previewId, transaction);
        const preview = createGerdanPreview(gerdan);
        const file = await this.bucketService.saveFile(preview, 'jpg', transaction);
        await gerdan.update({ previewId: file.id }, { transaction });

        return new GerdanDto(gerdan);
    }

    @Put(':id')
    @Auth()
    @ApiOperation({ summary: 'Edit gerdan' })
    @ApiOkResponse({ type: () => GerdanOutput })
    @ValidateSchema(GerdanSchema)
    async updateGerdan(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Param('id', Base10Pipe) id: string,
        @Body() body: GerdanInput
    ): Promise<GerdanDto> {
        const existedGerdan = await this.gerdansService.getGerdanByIdForUser(id, session.userId, transaction);
        if (!existedGerdan) throw new NotFoundException(ERROR_MESSAGES.gerdans.not_found);
        await this.gerdansService.update(existedGerdan, body, transaction);
        const gerdan = await this.gerdansService.getDetails(id, transaction);

        if (gerdan?.previewId) await this.bucketService.destroyFile(gerdan.previewId, transaction);
        const preview = createGerdanPreview(gerdan);
        const file = await this.bucketService.saveFile(preview, 'jpg', transaction);
        await gerdan.update({ previewId: file.id }, { transaction });

        return new GerdanDto(gerdan);
    }

    @Delete(':id')
    @Auth()
    @ApiOperation({ summary: 'Delete gerdan' })
    @HttpCode(204)
    async deleteGerdan(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Param('id', Base10Pipe) id: string,
    ) {
        const existedGerdan = await this.gerdansService.getGerdanByIdForUser(id, session.userId, transaction);
        if (!existedGerdan) throw new NotFoundException(ERROR_MESSAGES.gerdans.not_found);
        if (existedGerdan?.previewId) await this.bucketService.destroyFile(existedGerdan.previewId, transaction);
        await existedGerdan.destroy({ transaction });
    }
}
