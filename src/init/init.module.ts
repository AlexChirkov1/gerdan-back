import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Gerdan } from 'src/database/models/gerdan.model';
import { Pixel } from 'src/database/models/pixel.model';
import { Project } from 'src/database/models/project.model';
import { BucketService } from 'src/routes/bucket/bucket.service';
import { SupabaseService } from 'src/services/supabase/supabase.service';
import { InitService } from './init.service';
import { File } from 'src/database/models/file.model';
import { User } from 'src/database/models/user.model';

@Module({
    imports: [SequelizeModule.forFeature([Gerdan, Project, Pixel, File, User])],
    providers: [SupabaseService, BucketService, InitService]
})
export class InitModule implements OnModuleInit {
    private logger: Logger;
    constructor(
        private readonly initService: InitService,
    ) {
        this.logger = new Logger('InitModule');
    }

    async onModuleInit(): Promise<void> {
        this.logger.log('SERVER preparation');

        this.logger.log('SYNC FILES START');
        try {
            await this.initService.syncFiles();
        } catch (e) {
            this.logger.error('SYNC GERDANS FAILED. REASON: ', e);
            throw e;
        }
        this.logger.log('SYNC FILES END');

        this.logger.log('SYNC GERDANS START');
        try {
            await this.initService.migrateGerdans();
        } catch (e) {
            this.logger.error('SYNC GERDANS FAILED. REASON: ', e);
            throw e;
        }
        this.logger.log('SYNC GERDANS END');


        this.logger.log('SERVER PREPARATION ENDED');
    }
}
