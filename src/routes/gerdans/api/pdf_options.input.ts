import { ApiProperty } from '@nestjs/swagger';

export class PDFOptionsInput {
    @ApiProperty({ type: Boolean, default: true })
    numbers: boolean;
}
