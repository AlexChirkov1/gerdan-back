import { Module } from '@nestjs/common';
import { SupabaseService } from 'src/services/supabase/supabase.service';
import { DebugController } from './debug.controller';

@Module({
    controllers: [DebugController],
    providers: [SupabaseService]
})
export class DebugModule { }
