import { Injectable } from '@nestjs/common';

type FBResponse = {
    id: string;
    name: string;
    email: string;
};

type FBError = {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
};

@Injectable()
export class FacebookService {
    private baseUrl = 'https://graph.facebook.com/' as const;

    async fetchUserData(userId: string, accessToken: string): Promise<{ data: FBResponse, error: FBError }> {
        let data, error;
        try {
            data = await fetch(`${this.baseUrl}${userId}?access_token=${accessToken}&fields=name,email`);
            data = await data.json();
        } catch (e) {
            error = e.error;
        }

        return { data, error };
    }
}
