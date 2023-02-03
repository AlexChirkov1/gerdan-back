import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Gerdan } from 'src/database/models/gerdan.model';
import { Pixel } from 'src/database/models/pixel.model';
import { User } from 'src/database/models/user.model';
import { GerdansService } from '../gerdans/gerdans.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [SequelizeModule.forFeature([User, Gerdan, Pixel])],
    controllers: [UsersController],
    providers: [UsersService, GerdansService]
})
export class UsersModule { }
