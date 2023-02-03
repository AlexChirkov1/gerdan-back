import * as Joi from 'joi';

export const RefreshSessionSchema = Joi.object({
    refreshToken: Joi.string().required()
});
