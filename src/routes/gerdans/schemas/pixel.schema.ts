import * as Joi from 'joi';

export const PixelSchema = Joi.object({
    x: Joi.number().required(),
    y: Joi.number().required(),
    color: Joi.string().length(7).required(),
    index: Joi.number(),
    indexColor: Joi.string().length(7),
    indexCoordX: Joi.number(),
    indexCoordY: Joi.number()
})

