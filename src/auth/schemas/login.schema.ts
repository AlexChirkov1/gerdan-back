import * as Joi from 'joi';
import { validationRules } from 'src/common/validations.rules';

export const LoginSchema = Joi.object({
    password: Joi.string()
        .pattern(validationRules.passwordRegex)
        .min(6)
        .max(30)
        .required()
        .messages({ 'string.pattern.base': 'password should contain alphanumeric characters and set of special characters: [!, @, #, $, %, ^, &, *, (, ), _, -, +, =]' }),
    email: Joi.string()
        .email({ minDomainSegments: 2 })
        .max(validationRules.stringMaxLength)
        .required(),
});
