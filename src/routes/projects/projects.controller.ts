import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Res, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { Transaction } from 'sequelize';
import { UserSession, UserSessionData } from 'src/auth/decorators/userSession.decorator';
import { Auth } from 'src/auth/guards';
import { Base10Pipe } from 'src/common/base10.pipe';
import { CursorPaginationInput } from 'src/common/cursor_pagination.input';
import { CursorPaginationSchema } from 'src/common/cursor_pagination.schema';
import { ValidateSchema } from 'src/common/validate.decorator';
import { validationRules } from 'src/common/validations.rules';
import { SequelizeTransaction } from 'src/database/common/transaction.decorator';
import { TransactionInterceptor } from 'src/database/common/transaction.interceptor';
import { getFileType } from 'src/database/file_types';
import { ProjectTypeEnum } from 'src/database/models/project.model';
import { NotFoundException } from 'src/errors/handlers/not_found.exception';
import { ERROR_MESSAGES } from 'src/errors/messages';
import { SupabaseService } from 'src/services/supabase/supabase.service';
import { useDefault } from 'src/utils/use_default';
import { BucketService } from '../../services/bucket/bucket.service';
import { PDFOptionsInput, ProjectMetadataInput, ProjectSchemaInput } from './dtos/input_types';
import { ProjectListDto } from './dtos/project_list.dto';
import { ProjectMetadataDto } from './dtos/project_metadata.dto';
import { ProjectSchemaDto } from './dtos/project_schema.dto';
import { PDFFactory } from './pdf_factory';
import { createPreview } from './preview';
import { ProjectsService } from './projects.service';
import { PDFOptionsSchema } from './schemas/pdf_options.schema';
import { ProjectSchema } from './schemas/project.schema';
import { ProjectMetadataSchema } from './schemas/project_metadata.schema';

@Controller('projects')
@UseInterceptors(TransactionInterceptor)
export class ProjectsController {
    constructor(
        private readonly projectsService: ProjectsService,
        private readonly bucketService: BucketService,
        private readonly supabaseService: SupabaseService,
    ) { }

    @Get()
    @Auth()
    @ValidateSchema(CursorPaginationSchema)
    async getProjects(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Query() query: CursorPaginationInput
    ) {
        let projects = [];
        let cursors = {};
        const totalCount = await this.projectsService.countProjectsForUser(session.userId, transaction);
        if (totalCount) {
            const records = query.records ?? validationRules.defaultPagination;
            projects = await this.projectsService.getProjectsForUser(records, session.userId, query.id, transaction);
            cursors = await this.projectsService.getCursors(records, projects[0].id, transaction);
        }

        return new ProjectListDto(projects, { totalCount, count: projects.length, ...cursors });
    }

    @Post()
    @Auth()
    @ValidateSchema(ProjectMetadataSchema)
    async createNewProject(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Body() body: ProjectMetadataInput,
    ) {
        const project = await this.projectsService.createProject({
            name: body.name,
            type: ProjectTypeEnum[body.type],
            backgroundColor: body.backgroundColor,
            userId: session.userId
        }, transaction);
        const preview = createPreview(project);
        const file = await this.bucketService.prepareJPGFile(session.userId, transaction);
        await project.update({ previewId: file.id }, { transaction });
        await this.supabaseService.addFileToStorage(preview, session.userId, `${file.name}.${getFileType(file.type)}`);

        return new ProjectMetadataDto(project);
    }

    @Put(':id')
    @Auth()
    @ValidateSchema(ProjectSchema)
    async updateSchema(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Param('id', Base10Pipe) id: string,
        @Body() body: ProjectSchemaInput
    ) {
        let project = await this.projectsService.getProjectByIdForUser(id, session.userId, transaction);
        if (!project) throw new NotFoundException(ERROR_MESSAGES.PROJECTS.not_found);
        await this.projectsService.updateProject(project.id, {
            name: body.name ?? project.name,
            type: body.type ? ProjectTypeEnum[body.type] : project.type,
            backgroundColor: body.backgroundColor ?? project.backgroundColor,
            schema: JSON.stringify(body.schema),
            colormap: JSON.stringify(body.colormap),
            alias: body.alias && JSON.stringify(body.alias),
        }, transaction);
        project = await this.projectsService.getDetails(id, transaction);
        const preview = createPreview(project);
        await this.supabaseService.updateFileInStorage(preview, session.userId, `${project.preview.name}.${getFileType(project.preview.type)}`);

        return new ProjectSchemaDto(project);
    }

    @Get(':id')
    @Auth()
    @ValidateSchema(ProjectSchema)
    async getProjectDetails(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Param('id', Base10Pipe) id: string,
    ) {
        let project = await this.projectsService.getProjectByIdForUser(id, session.userId, transaction);
        if (!project) throw new NotFoundException(ERROR_MESSAGES.PROJECTS.not_found);
        project = await this.projectsService.getDetails(id, transaction);
        return new ProjectSchemaDto(project);
    }

    @Delete(':id')
    @Auth()
    @HttpCode(204)
    async deleteProject(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Param('id', Base10Pipe) id: string,
    ) {
        let project = await this.projectsService.getProjectByIdForUser(id, session.userId, transaction);
        if (!project) throw new NotFoundException(ERROR_MESSAGES.PROJECTS.not_found);
        project = await this.projectsService.getDetails(id, transaction);
        if (project?.previewId) {
            await this.supabaseService.destroyFileInStorage(session.userId, `${project.preview.name}.${getFileType(project.preview.type)}`);
            await this.bucketService.destroyFile(project.previewId, transaction);
        }
        await project.destroy({ transaction });
    }

    @Post(':id/pdf')
    @Auth()
    @ValidateSchema(PDFOptionsSchema)
    async getPDF(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Param('id', Base10Pipe) id: string,
        @Body() body: PDFOptionsInput,
        @Res() res: Response,
    ) {
        useDefault(body, 'numbers', true);
        useDefault(body, 'rulers', true);
        useDefault(body, 'instruction', true);

        let project = await this.projectsService.getProjectByIdForUser(id, session.userId, transaction);
        if (!project) throw new NotFoundException(ERROR_MESSAGES.PROJECTS.not_found);
        if (body.alias) await this.projectsService.updateProject(project.id, { alias: JSON.stringify(body.alias) });
        project = await this.projectsService.getDetails(id, transaction);

        const factory = new PDFFactory(project, { numbers: body.numbers, rulers: body.rulers });
        factory
            .startDocument()
            .addInfoPage()
            .addSchema();
        if (body.instruction) factory.addInstruction();
        const file = await factory.endDocument();

        res.status(201).send(file);
    }
}
