export type ErrorMessage = {
    message: string;
    code: number;
}

export const ERROR_MESSAGES = {
    AUTH: {
        code: 100,
        email_already_exist: {
            message: 'User witch such email already exist',
            code: 101
        },
        username_already_exist: {
            message: 'User witch such username already exist',
            code: 102
        },
        invalid_credentials: {
            message: 'User with such email and password was not found',
            code: 103
        },
        invalid_token: {
            message: 'Your token invalid',
            code: 104
        }
    },
    GERDANS: {
        code: 200, 
        not_found: {
            message: 'Gerdan not found',
            code: 201
        }
    },
    FILES: {
        code: 300,
        not_found: {
            message: 'File not found',
            code: 301
        }
    }
}