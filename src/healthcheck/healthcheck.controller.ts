import { Controller, Get, HttpCode, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('healthcheck')
@Controller('healthcheck')
export class HealthcheckController {

    @Get('ping')
    @ApiOkResponse()
    @HttpCode(200)
    async ping(@Res() res: Response): Promise<void> {
        res.status(200).send('pong');
    }

}
