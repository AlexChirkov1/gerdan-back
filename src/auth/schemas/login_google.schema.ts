import * as Joi from 'joi';

export const LoginGoogleSchema = Joi.object({
    token: Joi.string()
        .required()
});
