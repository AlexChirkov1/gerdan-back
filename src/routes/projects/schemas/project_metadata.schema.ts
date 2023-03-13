import * as Joi from 'joi';
import { validationRules } from 'src/common/validations.rules';
import { ProjectTypeKeys } from '../resources/project_type_keys';

export const ProjectMetadataSchema = Joi.object({
    name: Joi.string()
        .max(validationRules.stringMaxLength)
        .required(),
    type: Joi.string()
        .valid(...ProjectTypeKeys)
        .required(),
    backgroundColor: Joi.string()
        .regex(validationRules.colorRegex)
        .length(7)
        .required()
        .messages({ 'string.pattern.base': 'backgroundColor should be a valid hex color with hashtag' })
});
