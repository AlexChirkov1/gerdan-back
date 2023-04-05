import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FILE_BUCKET } from './buckets';

@Injectable()
export class SupabaseService {
    private readonly supabaseClient: SupabaseClient;

    constructor(private readonly configService: ConfigService) {
        const STORAGE_URL = this.configService.get('STORAGE_URL');
        const SERVICE_KEY = this.configService.get('SERVICE_KEY');
        this.supabaseClient = createClient(STORAGE_URL, SERVICE_KEY);
    }

    async createBucket() {
        const bucket = await this.getFileBucketDetails();
        if (bucket.error) await this.createFileBucket();
    }

    async getFileBucketDetails() {
        return await this.supabaseClient.storage.getBucket(FILE_BUCKET);
    }

    async createFileBucket() {
        return await this.supabaseClient.storage.createBucket(FILE_BUCKET, { public: true });
    }

    async addFileToStorage(file: Buffer, userId: ID, name: string) {
        return await this.supabaseClient.storage.from(FILE_BUCKET).upload(`${userId}/${name}`, file);
    }

    async updateFileInStorage(file: Buffer, userId: ID, name: string) {
        await this.supabaseClient.storage.from(FILE_BUCKET).update(`${userId}/${name}`, file);
    }

    async destroyFileInStorage(userId: ID, name: string) {
        await this.supabaseClient.storage.from(FILE_BUCKET).remove([`${userId}/${name}`]);
    }

    async getFilesList(userId: ID, limit: number, offset: number) {
        return await this.supabaseClient.storage.from(FILE_BUCKET).list(`${userId}`, { limit, offset });
    }
}
