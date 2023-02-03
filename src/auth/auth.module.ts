import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/database/models/user.model';
import { UsersService } from 'src/routes/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BearerStrategy } from './bearer.strategy';

@Module({
    imports: [SequelizeModule.forFeature([User])],
    controllers: [AuthController],
    providers: [AuthService, BearerStrategy, UsersService],
})
export class AuthModule { }
