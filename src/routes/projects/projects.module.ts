import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Project } from 'src/database/models/project.model';
import { SupabaseService } from 'src/services/supabase/supabase.service';
import { BucketModule } from '../../services/bucket/bucket.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
    imports: [
        BucketModule,
        SequelizeModule.forFeature([Project])
    ],
    controllers: [ProjectsController],
    providers: [ProjectsService, SupabaseService]
})
export class ProjectsModule { }
