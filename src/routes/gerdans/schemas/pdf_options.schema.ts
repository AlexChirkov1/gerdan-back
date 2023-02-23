import * as Joi from 'joi';

export const PDFOptionsSchema = Joi.object({
    numbers: Joi.boolean().default(true).optional()
});
