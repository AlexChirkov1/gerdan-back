import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorMessage } from '../messages';

export class NotFoundException extends HttpException {
    error: ErrorMessage;
    constructor(error?: ErrorMessage) {
        super('Not Found', HttpStatus.NOT_FOUND);
        this.error = error;
    }
}
