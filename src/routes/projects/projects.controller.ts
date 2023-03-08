import { Body, Controller, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { UserSession, UserSessionData } from 'src/auth/decorators/userSession.decorator';
import { Auth } from 'src/auth/guards';
import { Base10Pipe } from 'src/common/base10.pipe';
import { ValidateSchema } from 'src/common/validate.decorator';
import { SequelizeTransaction } from 'src/database/common/transaction.decorator';
import { TransactionInterceptor } from 'src/database/common/transaction.interceptor';
import { ProjectTypeEnum } from 'src/database/models/project.model';
import { NotFoundException } from 'src/errors/handlers/not_found.exception';
import { ERROR_MESSAGES } from 'src/errors/messages';
import { ProjectMetadataDto } from './dtos/project_metadata.dto';
import { ProjectSchemaDto } from './dtos/project_schema.dto';
import { ProjectMetadataInput, ProjectSchemaInput } from './dtos/input_types';
import { ProjectsService } from './projects.service';
import { ProjectSchema } from './schemas/project.schema';
import { ProjectMetadataSchema } from './schemas/project_metadata.schema';

@Controller('projects')
@UseInterceptors(TransactionInterceptor)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    @Auth()
    @ValidateSchema(ProjectMetadataSchema)
    async createNewProject(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Body() body: ProjectMetadataInput,
    ): Promise<ProjectMetadataDto> {
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
        // TODO: async create preview
        // async save preview on bucket
        project = await this.projectsService.getProjectByIdForUser(id, session.userId, transaction);
        return new ProjectSchemaDto(project);
    }
}
