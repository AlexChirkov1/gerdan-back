import * as Joi from 'joi';
import { validationRules } from './validations.rules';

export const CursorPaginationSchema = Joi.object({
    id: Joi.string()
        .base64({ paddingRequired: false, urlSafe: true })
        .optional(),
    records: Joi.number()
        .integer()
        .positive()
        .max(validationRules.maxPagination)
        .default(validationRules.defaultPagination)
        .optional(),
});
