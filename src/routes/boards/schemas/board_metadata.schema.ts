import * as Joi from 'joi';
import { validationRules } from 'src/common/validations.rules';
import { BoardTypeKeys } from '../resources/board_type_keys';

export const BoardMetadataSchema = Joi.object({
    name: Joi.string().max(validationRules.stringMaxLength).required(),
    type: Joi.string().valid(...BoardTypeKeys).required(),
    backgroundColor: Joi.string().regex(validationRules.colorRegex).length(7).required()
        .messages({ 'string.pattern.base': 'backgroundColor should be a valid hex color with hashtag' })
});
