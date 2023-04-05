import * as Joi from 'joi';

export const LoginFacebookSchema = Joi.object({
    userId: Joi.string().required(),
    accessToken: Joi.string().required()
});
