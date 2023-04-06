import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { File } from 'src/database/models/file.model';
import { BucketService } from './bucket.service';

@Module({
    imports: [SequelizeModule.forFeature([File])],
    providers: [BucketService],
    exports: [BucketService]
})
export class BucketModule { }
