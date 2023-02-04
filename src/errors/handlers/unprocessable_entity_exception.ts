import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorMessage } from '../messages';

export class UnprocessableEntityException extends HttpException {
    error: ErrorMessage;
    constructor(error?: ErrorMessage) {
        super('Unprocessable Entity', HttpStatus.UNPROCESSABLE_ENTITY);
        this.error = error;
    }
}
