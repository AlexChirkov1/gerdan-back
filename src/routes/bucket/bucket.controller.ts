import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ERROR_MESSAGES } from 'src/common/error_messages';
import { FileIdPipe } from 'src/common/file_id.pipe';
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
        if (!file) throw new NotFoundException(ERROR_MESSAGES.file.not_found);
        res.sendFile(file.path);
    }
}
