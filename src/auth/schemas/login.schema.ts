import * as Joi from 'joi';
import { validationRules } from 'src/common/validations.rules';

export const LoginSchema = Joi.object({
    password: Joi.string().pattern(validationRules.passwordRegex).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).max(validationRules.stringMaxLength).required(),
});
