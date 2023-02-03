import { BadRequestException, Body, Controller, Get, Patch, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Transaction } from 'sequelize';
import { UserSession, UserSessionData } from 'src/auth/decorators/userSession.decorator';
import { Auth } from 'src/auth/guards';
import { ERROR_MESSAGES } from 'src/common/error_messages';
import { ValidateSchema } from 'src/common/validate.decorator';
import { SequelizeTransaction } from 'src/database/common/transaction.decorator';
import { TransactionInterceptor } from 'src/database/common/transaction.interceptor';
import { GerdansService } from '../gerdans/gerdans.service';
import { UserDetailsOutput } from './api/user-details.output';
import { UserInput } from './api/user.input';
import { UserDetailsDto } from './dtos/user-details.dto';
import { UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseInterceptors(TransactionInterceptor)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly gerdansService: GerdansService,
    ) { }

    @Get('me')
    @Auth()
    @ApiOperation({ summary: 'Get my profile' })
    @ApiOkResponse({ type: () => UserDetailsOutput })
    async getMyProfile(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData
    ): Promise<UserDetailsDto> {
        const user = await this.usersService.findUserById(session.userId, transaction);
        const gerdansCount = await this.gerdansService.countGerdansForUser(session.userId, transaction);
        return new UserDetailsDto(user, gerdansCount);
    }

    @Patch('me')
    @Auth()
    @ApiOperation({ summary: 'Update my profile' })
    @ApiOkResponse({ type: () => UserDetailsOutput })
    @ValidateSchema(UserSchema)
    async updateMyProfile(
        @SequelizeTransaction() transaction: Transaction,
        @UserSession() session: UserSessionData,
        @Body() body: UserInput,
    ): Promise<UserDetailsDto> {
        let existedUser = await this.usersService.findUserByEmail(body.email, transaction);
        if (existedUser) throw new BadRequestException(ERROR_MESSAGES.auth.email_already_exist);
        existedUser = await this.usersService.findUserByUsername(body.username, transaction);
        if (existedUser) throw new BadRequestException(ERROR_MESSAGES.auth.username_already_exist);

        let user = await this.usersService.findUserById(session.userId, transaction);
        await this.usersService.update(user, body, transaction);
        user = await this.usersService.findUserById(user.id, transaction);
        const gerdansCount = await this.gerdansService.countGerdansForUser(session.userId, transaction);

        return new UserDetailsDto(user, gerdansCount);
    }
}
