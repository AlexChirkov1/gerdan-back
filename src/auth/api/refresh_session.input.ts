import { ApiProperty } from '@nestjs/swagger';

export class RefreshSessionInput {
    @ApiProperty()
    refreshToken: string;
}
