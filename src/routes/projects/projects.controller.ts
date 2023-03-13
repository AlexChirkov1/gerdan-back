import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
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
import { ProjectTypeEnum } from 'src/database/models/project.model';
import { NotFoundException } from 'src/errors/handlers/not_found.exception';
import { ERROR_MESSAGES } from 'src/errors/messages';
import { ProjectMetadataInput, ProjectSchemaInput } from './dtos/input_types';
import { ProjectListDto } from './dtos/project_list.dto';
import { ProjectMetadataDto } from './dtos/project_metadata.dto';
import { ProjectSchemaDto } from './dtos/project_schema.dto';
import { ProjectsService } from './projects.service';
import { ProjectSchema } from './schemas/project.schema';
import { ProjectMetadataSchema } from './schemas/project_metadata.schema';

@Controller('projects')
@UseInterceptors(TransactionInterceptor)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

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
        await this.projectsService.updateSchema(project.id, {
            type: body.type ? ProjectTypeEnum[body.type] : project.type,
            backgroundColor: body.backgroundColor ?? project.backgroundColor,
            schema: JSON.stringify(body.schema),
            colormap: JSON.stringify(body.colormap),
        }, transaction);
        project = await this.projectsService.getProjectByIdForUser(id, session.userId, transaction);
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
        const project = await this.projectsService.getProjectByIdForUser(id, session.userId, transaction);
        if (!project) throw new NotFoundException(ERROR_MESSAGES.PROJECTS.not_found);
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
            // TODO: destroying files
        }
        await project.destroy({ transaction });
    }
}
