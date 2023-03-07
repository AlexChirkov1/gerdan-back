import { Controller, Get, HttpCode, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('healthcheck')
export class HealthcheckController {

    @Get('ping')
    @HttpCode(200)
    async ping(@Res() res: Response): Promise<void> {
        res.status(200).send('pong');
    }

}
