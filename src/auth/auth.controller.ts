import { BadRequestException, Body, Controller, Post, Put, UseInterceptors } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Transaction } from 'sequelize';
import { ERROR_MESSAGES } from 'src/common/error_messages';
import { ValidateSchema } from 'src/common/validate.decorator';
import { SequelizeTransaction } from 'src/database/common/transaction.decorator';
import { TransactionInterceptor } from 'src/database/common/transaction.interceptor';
import { UsersService } from 'src/routes/users/users.service';
import { LoginInput } from './api/login_.input';
import { RefreshSessionInput } from './api/refresh_session.input';
import { RegistrationOutput } from './api/registration.output';
import { RegistrationInput } from './api/registration_input';
import { SessionOutput } from './api/session.output';
import { AuthService, JWT_TYPES } from './auth.service';
import { NewUserDto } from './dtos/new-user.dto';
import { SessionDto } from './dtos/session.dto';
import { LoginSchema } from './schemas/login.schema';
import { RefreshSessionSchema } from './schemas/refresh_session.schema';
import { RegistrationSchema } from './schemas/registration.schema';


@ApiTags('auth')
@Controller('auth')
@UseInterceptors(TransactionInterceptor)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }

    @Post('registration')
    @ApiOperation({ summary: 'Registration' })
    @ApiCreatedResponse({ type: () => RegistrationOutput })
    @ValidateSchema(RegistrationSchema)
    async registration(
        @SequelizeTransaction() transaction: Transaction,
        @Body() body: RegistrationInput
    ): Promise<NewUserDto> {
        let existedUser = await this.usersService.findUserByEmail(body.email, transaction);
        if (existedUser) throw new BadRequestException(ERROR_MESSAGES.auth.email_already_exist);
        existedUser = await this.usersService.findUserByUsername(body.username, transaction);
        if (existedUser) throw new BadRequestException(ERROR_MESSAGES.auth.username_already_exist);
        const user = await this.usersService.create(body, transaction);
        return new NewUserDto(user);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login' })
    @ApiCreatedResponse({ type: () => SessionOutput })
    @ValidateSchema(LoginSchema)
    async login(
        @SequelizeTransaction() transaction: Transaction,
        @Body() body: LoginInput
    ): Promise<SessionDto> {
        const user = await this.usersService.findUserByEmail(body.email, transaction);
        if (!user) throw new BadRequestException(ERROR_MESSAGES.auth.invalid_credentials);
        if (!this.authService.comparePasswords(body.password, user.password, user.salt)) throw new BadRequestException(ERROR_MESSAGES.auth.invalid_credentials);
        const { accessToken, refreshToken } = this.authService.generateTokens(user.id);
        return new SessionDto(accessToken, refreshToken);
    }

    @Put('refresh')
    @ApiOperation({ summary: 'Refresh' })
    @ApiCreatedResponse({ type: () => SessionOutput })
    @ValidateSchema(RefreshSessionSchema)
    async refresh(
        @SequelizeTransaction() transaction: Transaction,
        @Body() body: RefreshSessionInput
    ): Promise<SessionDto> {
        const tokenData = this.authService.verifyToken(body.refreshToken);
        if (!tokenData?.userId || !tokenData?.sessionToken || tokenData?.type !== JWT_TYPES.refresh) throw new BadRequestException(ERROR_MESSAGES.auth.invalid_token);
        const user = await this.usersService.findUserById(tokenData.userId, transaction);
        const { accessToken, refreshToken } = this.authService.generateTokens(user.id);
        return new SessionDto(accessToken, refreshToken);
    }
}
