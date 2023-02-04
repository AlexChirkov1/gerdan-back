import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorMessage } from '../messages';

export class UnauthorizedException extends HttpException {
    error: ErrorMessage;
    constructor(error?: ErrorMessage) {
        super('Unauthorized', HttpStatus.UNAUTHORIZED);
        this.error = error;
    }
}
