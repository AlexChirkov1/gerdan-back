import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Gerdan } from 'src/database/models/gerdan.model';
import { Pixel } from 'src/database/models/pixel.model';
import { User } from 'src/database/models/user.model';
import { BucketModule } from '../bucket/bucket.module';
import { UsersService } from '../users/users.service';
import { GerdansController } from './gerdans.controller';
import { GerdansService } from './gerdans.service';

@Module({
    imports: [
        BucketModule,
        SequelizeModule.forFeature([Gerdan, Pixel, User])
    ],
    controllers: [GerdansController],
    providers: [GerdansService, UsersService]
})
export class GerdansModule { }
