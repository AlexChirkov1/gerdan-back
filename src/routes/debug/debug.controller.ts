import { Controller, Get, NotImplementedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SupabaseService } from 'src/services/supabase/supabase.service';

@ApiTags('debug')
@Controller('debug')
export class DebugController {
    constructor(private readonly supabaseService: SupabaseService) { }

    @Get()
    async test() {
        throw new NotImplementedException();
    }
}
