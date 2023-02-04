import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorMessage } from '../messages';

export class BadRequestException extends HttpException {
    error: ErrorMessage | string[];
    constructor(error?: ErrorMessage | string[]) {
        super('Bad Request', HttpStatus.BAD_REQUEST);
        this.error = error;
    }
}
