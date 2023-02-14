import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FileIdPipe } from 'src/common/file_id.pipe';
import { NotFoundException } from 'src/errors/handlers/not_found.exception';
import { ERROR_MESSAGES } from 'src/errors/messages';
import { BucketService } from './bucket.service';

@ApiTags('bucket')
@Controller('bucket')
export class BucketController {
    constructor(private readonly bucketService: BucketService) { }

    @Get(':id')
    async get(
        @Param('id', FileIdPipe) id: string,
        @Res() res: Response
    ) {
        const file = await this.bucketService.getFileById(id);
        if (!file) throw new NotFoundException(ERROR_MESSAGES.FILES.not_found);
        res.send(file.blob);
    }
}
