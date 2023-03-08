import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Project } from 'src/database/models/project.model';

type ProjectMetadata = {
    userId: ID;
    name: string;
    type: number;
    backgroundColor?: string;
};

type ProjectSchemaData = {
    type: number;
    backgroundColor?: string;
    schema: string;
    colormap: string;
};

@Injectable()
export class ProjectsService {
    constructor(
        @InjectModel(Project)
        private readonly projectModel: typeof Project
    ) { }

    async createProject(metadata: ProjectMetadata, transaction: Transaction): Promise<Project> {
        return await this.projectModel.create(metadata, { transaction });
    }

    async getProjectByIdForUser(id: ID, userId: ID, transaction?: Transaction): Promise<Project> {
        return await this.projectModel.findOne({ where: { id, userId }, transaction });
    }

    async updateSchema(id: ID, projectSchema: ProjectSchemaData, transaction?: Transaction): Promise<void> {
        await this.projectModel.update(projectSchema, { where: { id }, transaction });
    }

    async getDetails(id: ID, transaction?: Transaction): Promise<Project> {
        return await this.projectModel.scope([
            'withAuthor',
            'withPreview'
        ]).findByPk(id, { transaction });
    }
}
