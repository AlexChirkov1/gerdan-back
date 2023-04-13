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
    name?: string;
    type?: number;
    backgroundColor?: string;
    schema?: string;
    colormap?: string;
    alias?: string;
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
        return await this.projectModel
            .scope([
                'withoutSchema'
            ])
            .findOne({ where: { id, userId, }, transaction });
    }

    async updateProject(id: ID, projectSchema: ProjectSchemaData, transaction?: Transaction): Promise<void> {
        await this.projectModel.update(projectSchema, { where: { id }, transaction });
    }

    async getDetails(id: ID, transaction?: Transaction): Promise<Project> {
        return await this.projectModel
            .scope([
                'withAuthor',
                'withPreview'
            ])
            .findByPk(id, { transaction });
    }

    async getCursors(records: number, id: ID, transaction?: Transaction): Promise<{ prev: ID | null, next: ID | null; }> {
        const prev = await this.getPrevCursor(records, id, transaction);
        const next = await this.getNextCursor(records, id, transaction);
        return { prev, next };
    }

    async getPrevCursor(records: number, id: ID, transaction?: Transaction): Promise<ID | null> {
        const gerdan = await this.projectModel
            .scope([
                { method: ['prevCursor', records, id] },
                'withoutSchema'
            ])
            .findOne({ transaction });
        return gerdan?.id;
    }

    async getNextCursor(records: number, id: ID, transaction?: Transaction): Promise<ID | null> {
        const gerdan = await this.projectModel
            .scope([
                { method: ['nextCursor', records, id] },
                'withoutSchema'
            ])
            .findOne({ transaction });
        return gerdan?.id;
    }

    async countProjectsForUser(userId: ID, transaction?: Transaction): Promise<number> {
        return await this.projectModel.scope([{ method: ['byAuthorId', userId] }]).count({ transaction });
    }

    async getProjectsForUser(records: number, userId: ID, id?: ID, transaction?: Transaction): Promise<Project[]> {
        return await this.projectModel.scope([
            'withoutSchema',
            'withAuthor',
            'withPreview',
            { method: ['byAuthorId', userId] },
            { method: ['pagination', records, id] }
        ]).findAll({ transaction, subQuery: false });
    }
}
