import * as Joi from 'joi';
import { validationRules } from 'src/common/validations.rules';
import { PixelSchema } from './pixel.schema';

export const GerdanSchema = Joi.object({
    name: Joi.string().max(validationRules.stringMaxLength).required(),
    width: Joi.number().required(),
    height: Joi.number().required(),
    pixelSize: Joi.number().required(),
    backgroundColor: Joi.string().length(7).required(),
    pixels: Joi.array().items(PixelSchema)
});
