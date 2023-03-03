import { Body, Controller, Post, Put, UseInterceptors } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Transaction } from 'sequelize';
import { ValidateSchema } from 'src/common/validate.decorator';
import { SequelizeTransaction } from 'src/database/common/transaction.decorator';
import { TransactionInterceptor } from 'src/database/common/transaction.interceptor';
import { BadRequestException } from 'src/errors/handlers/bad_request_exception';
import { ERROR_MESSAGES } from 'src/errors/messages';
import { UsersService } from 'src/routes/users/users.service';
import { GoogleService } from 'src/services/google/google.service';
import { LoginInput } from './api/login_.input';
import { LoginGoogleInput } from './api/login_google.input';
import { RefreshSessionInput } from './api/refresh_session.input';
import { RegistrationOutput } from './api/registration.output';
import { RegistrationInput } from './api/registration_input';
import { SessionOutput } from './api/session.output';
import { AuthService, JWT_TYPES } from './auth.service';
import { NewUserDto } from './dtos/new-user.dto';
import { SessionDto } from './dtos/session.dto';
import { LoginSchema } from './schemas/login.schema';
import { LoginGoogleSchema } from './schemas/login_google.schema';
import { RefreshSessionSchema } from './schemas/refresh_session.schema';
import { RegistrationSchema } from './schemas/registration.schema';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(TransactionInterceptor)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly googleService: GoogleService,
    ) { }

    @Post('google')
    @ApiOperation({ summary: 'Create new session via Google' })
    @ApiCreatedResponse({ type: () => SessionOutput })
    @ValidateSchema(LoginGoogleSchema)
    async createSessionWithGoogle(
        @SequelizeTransaction() transaction: Transaction,
        @Body() body: LoginGoogleInput
    ): Promise<SessionDto> {
        const userData = await this.googleService.verifyToken(body.token);
        let user = await this.usersService.findUserByEmail(userData.email, transaction);
        if (!user) user = await this.usersService.createWithGoogle(userData, transaction);
        const { accessToken, refreshToken } = this.authService.generateTokens(user.id);
        return new SessionDto(accessToken, refreshToken);
    }

    @Post('registration')
    @ApiOperation({ summary: 'Registration' })
    @ApiCreatedResponse({ type: () => RegistrationOutput })
    @ValidateSchema(RegistrationSchema)
    async registration(
        @SequelizeTransaction() transaction: Transaction,
        @Body() body: RegistrationInput
    ): Promise<NewUserDto> {
        const existedUser = await this.usersService.findUserByEmail(body.email, transaction);
        if (existedUser) throw new BadRequestException(ERROR_MESSAGES.AUTH.email_already_exist);
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
        if (!user) throw new BadRequestException(ERROR_MESSAGES.AUTH.invalid_credentials);
        if (!this.authService.comparePasswords(body.password, user.password, user.salt)) throw new BadRequestException(ERROR_MESSAGES.AUTH.invalid_credentials);
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
        if (!tokenData?.userId || !tokenData?.sessionToken || tokenData?.type !== JWT_TYPES.refresh) throw new BadRequestException(ERROR_MESSAGES.AUTH.invalid_token);
        const user = await this.usersService.findUserById(tokenData.userId, transaction);
        const { accessToken, refreshToken } = this.authService.generateTokens(user.id);
        return new SessionDto(accessToken, refreshToken);
    }
}
