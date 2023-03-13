export type LoginInput = {
    email: string;
    password: string;
};

export type RegistrationInput = {
    username: string;
    email: string;
    password: string;
};

export type LoginGoogleInput = {
    token: string;
};

export type RefreshSessionInput = {
    refreshToken: string;
}

