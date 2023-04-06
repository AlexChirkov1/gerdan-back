import * as Joi from 'joi';

export const PDFOptionsSchema = Joi.object({
    numbers: Joi.boolean().default(true).optional(),
    rulers: Joi.boolean().default(true).optional(),
    instruction: Joi.boolean().default(true).optional(),
    alias: Joi.array()
        .items(Joi.object({
            number: Joi
                .number()
                .min(0)
                .required(),
            as: Joi
                .string()
                .min(0)
                .max(100)
                .required()
        }))
        .optional()
});
