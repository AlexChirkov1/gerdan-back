import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { File } from 'src/database/models/file.model';
import { BucketController } from './bucket.controller';
import { BucketService } from './bucket.service';

@Module({
    imports: [SequelizeModule.forFeature([File])],
    controllers: [BucketController],
    providers: [BucketService],
    exports: [BucketService]
})
export class BucketModule { }
