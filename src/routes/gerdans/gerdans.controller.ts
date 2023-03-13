import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Res, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { Transaction } from 'sequelize';
import { UserSession, UserSessionData } from 'src/auth/decorators/userSession.decorator';
import { Auth } from 'src/auth/guards';
import { Base10Pipe } from 'src/common/base10.pipe';
import { CursorPaginationInput } from 'src/common/cursor_pagination.input';
import { CursorPaginationSchema } from 'src/common/cursor_pagination.schema';
import { ValidateSchema } from 'src/common/validate.decorator';
import { SequelizeTransaction } from 'src/database/common/transaction.decorator';
import { TransactionInterceptor } from 'src/database/common/transaction.interceptor';
import { getFileType } from 'src/database/file_types';
import { NotFoundException } from 'src/errors/handlers/not_found.exception';
import { ERROR_MESSAGES } from 'src/errors/messages';
import { createGerdanPreview, generateGerdanPDF } from 'src/services/gerdan/gerdan';
import { SupabaseService } from 'src/services/supabase/supabase.service';
import { FileStorageHelper } from 'src/utils/file_storage.helper';
import { BucketService } from '../bucket/bucket.service';
import { UsersService } from '../users/users.service';
import { GerdanDto } from './dtos/gerdan.dto';
import { GerdansDto } from './dtos/gerdans.dto';
import { GerdanInput, PDFOptionsInput } from './dtos/input_types';
import { GerdansService } from './gerdans.service';
import { GerdanSchema } from './schemas/gerdan.schema';
import { PDFOptionsSchema } from './schemas/pdf_options.schema';

@Controller('gerdans')
@UseInterceptors(TransactionInterceptor)
export class GerdansController {
    constructor(
        private readonly gerdansService: GerdansService,
        private readonly usersService: UsersService,
        private readonly bucketService: BucketService,
        private readonly supabaseService: SupabaseService,
    ) { }

    @Get()
    @Auth()
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
    async getGerdan(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Param('id', Base10Pipe) id: string,
    ): Promise<GerdanDto> {
        const existedGerdan = await this.gerdansService.getGerdanByIdForUser(id, session.userId, transaction);
        if (!existedGerdan) throw new NotFoundException(ERROR_MESSAGES.GERDANS.not_found);
        const gerdan = await this.gerdansService.getDetails(id, transaction);

        return new GerdanDto(gerdan);
    }

    @Get(':id/pdf')
    @Auth()
    @ValidateSchema(PDFOptionsSchema)
    async getPDF(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Param('id', Base10Pipe) id: string,
        @Query() query: PDFOptionsInput,
        @Res() res: Response,
    ) {

        if (query.numbers && typeof query.numbers === 'string') {
            switch (query.numbers) {
                case 'true': {
                    query.numbers = true;
                    break;
                }
                case 'false': {
                    query.numbers = false;
                    break;
                }
                default: {
                    query.numbers = true;
                }
            }
        } else {
            query.numbers = true;
        }

        const existedGerdan = await this.gerdansService.getGerdanByIdForUser(id, session.userId, transaction);
        if (!existedGerdan) throw new NotFoundException(ERROR_MESSAGES.GERDANS.not_found);
        const gerdan = await this.gerdansService.getDetails(id, transaction);
        const user = await this.usersService.findUserById(session.userId, transaction);

        const filePath = FileStorageHelper.prepareFilePathToTempFolder(`${user.username}-${gerdan.name}`, 'pdf');
        generateGerdanPDF(gerdan, user, filePath, query);
        const file = await FileStorageHelper.extractFile(filePath);
        res.status(201).send(file);
    }

    @Post()
    @Auth()
    @ValidateSchema(GerdanSchema)
    async createGerdan(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Body() body: GerdanInput
    ): Promise<GerdanDto> {
        const newGerdan = await this.gerdansService.create(body, session.userId, transaction);
        const gerdan = await this.gerdansService.getDetails(newGerdan.id, transaction);
        const preview = createGerdanPreview(gerdan);
        const file = await this.bucketService.prepareJPGFile(session.userId, transaction);
        await gerdan.update({ previewId: file.id }, { transaction });
        await this.supabaseService.addFileToStorage(preview, session.userId, `${file.name}.${getFileType(file.type)}`);

        return new GerdanDto(gerdan);
    }

    @Put(':id')
    @Auth()
    @ValidateSchema(GerdanSchema)
    async updateGerdan(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Param('id', Base10Pipe) id: string,
        @Body() body: GerdanInput
    ): Promise<GerdanDto> {
        const existedGerdan = await this.gerdansService.getGerdanByIdForUser(id, session.userId, transaction);
        if (!existedGerdan) throw new NotFoundException(ERROR_MESSAGES.GERDANS.not_found);
        await this.gerdansService.update(existedGerdan, body, transaction);
        const gerdan = await this.gerdansService.getDetails(id, transaction);
        const preview = createGerdanPreview(gerdan);
        await this.supabaseService.updateFileInStorage(preview, session.userId, `${gerdan.preview.name}.${getFileType(gerdan.preview.type)}`);

        return new GerdanDto(gerdan);
    }

    @Delete(':id')
    @Auth()
    @HttpCode(204)
    async deleteGerdan(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Param('id', Base10Pipe) id: string,
    ) {
        const existedGerdan = await this.gerdansService.getGerdanByIdForUser(id, session.userId, transaction);
        if (!existedGerdan) throw new NotFoundException(ERROR_MESSAGES.GERDANS.not_found);
        const gerdan = await this.gerdansService.getDetails(id, transaction);
        if (gerdan?.previewId) {
            await this.supabaseService.destroyFileInStorage(session.userId, `${gerdan.preview.name}.${getFileType(gerdan.preview.type)}`);
            await this.bucketService.destroyFile(gerdan.previewId, transaction);
        }
        await gerdan.destroy({ transaction });
    }
}
