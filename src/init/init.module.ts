import { Module, OnModuleInit } from '@nestjs/common';
import { InjectConnection, SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { getFileType } from 'src/database/file_types';
import { File } from 'src/database/models/file.model';
import { BucketService } from 'src/routes/bucket/bucket.service';
import { SupabaseService } from 'src/services/supabase/supabase.service';
import { InitService } from './init.service';

@Module({
    imports: [SequelizeModule.forFeature([File])],
    providers: [InitService, SupabaseService, BucketService]
})
export class InitModule implements OnModuleInit {
    constructor(
        private readonly initService: InitService,
        private readonly bucketService: BucketService,
        private readonly supabaseService: SupabaseService,
        @InjectConnection()
        private readonly sequelize: Sequelize,
    ) { }

    async onModuleInit(): Promise<void> {
        await this.initService.createBucket();

        await this.sequelize.transaction(async (transaction) => {
            const totalCount = await this.bucketService.countFiles(transaction);

            for (let limit = 100, offset = 0; offset <= totalCount; offset += limit) {
                const files = await this.bucketService.getFilesList(limit, offset, transaction);
                if (!files.length) break;

                for (const file of files) {
                    if (!file.blob) continue;
                    this.supabaseService.addFileToStorage(file.blob, file.userId, `${file.name}.${getFileType(file.type)}`);
                }
            }
        });
    }
}
