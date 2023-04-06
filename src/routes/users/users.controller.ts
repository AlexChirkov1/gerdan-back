import { Body, Controller, Get, Patch, UseInterceptors } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { UserSession, UserSessionData } from 'src/auth/decorators/userSession.decorator';
import { Auth } from 'src/auth/guards';
import { ValidateSchema } from 'src/common/validate.decorator';
import { SequelizeTransaction } from 'src/database/common/transaction.decorator';
import { TransactionInterceptor } from 'src/database/common/transaction.interceptor';
import { BadRequestException } from 'src/errors/handlers/bad_request_exception';
import { ERROR_MESSAGES } from 'src/errors/messages';
import { UserInput } from './dtos/input_types';
import { UserDetailsDto } from './dtos/user-details.dto';
import { UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';

@Controller('users')
@UseInterceptors(TransactionInterceptor)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @Auth()
    async getMyProfile(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData
    ): Promise<UserDetailsDto> {
        const user = await this.usersService.findUserById(session.userId, transaction);
        return new UserDetailsDto(user);
    }

    @Patch('me')
    @Auth()
    @ValidateSchema(UserSchema)
    async updateMyProfile(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Body() body: UserInput,
    ): Promise<UserDetailsDto> {
        const existedUser = await this.usersService.findUserByEmail(body.email, transaction);
        if (existedUser) throw new BadRequestException(ERROR_MESSAGES.AUTH.email_already_exist);
        let user = await this.usersService.findUserById(session.userId, transaction);
        await this.usersService.update(user, body, transaction);
        user = await this.usersService.findUserById(user.id, transaction);
        return new UserDetailsDto(user);
    }
}
