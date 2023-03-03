import { Module, OnModuleInit } from '@nestjs/common';
import { SupabaseService } from 'src/services/supabase/supabase.service';
import { InitService } from './init.service';

@Module({
    providers: [InitService, SupabaseService]
})
export class InitModule implements OnModuleInit {
    constructor(private initService: InitService) { }

    async onModuleInit(): Promise<void> {
        await this.initService.createBucket();
    }
}
