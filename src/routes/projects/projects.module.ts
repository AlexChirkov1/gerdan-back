import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Project } from 'src/database/models/project.model';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
    imports: [SequelizeModule.forFeature([Project])],
    controllers: [ProjectsController],
    providers: [ProjectsService]
})
export class ProjectsModule { }
