import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/services/supabase/supabase.service';


@Injectable()
export class InitService {
    constructor(private readonly supabaseService: SupabaseService) { }

    async createBucket() {
        const bucket = await this.supabaseService.getFileBucketDetails();
        if (bucket.error) await this.supabaseService.createFileBucket();
    }
}
