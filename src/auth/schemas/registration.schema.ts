import * as Joi from 'joi';
import { validationRules } from 'src/common/validations.rules';

export const RegistrationSchema = Joi.object({
    username: Joi.string().pattern(validationRules.usernameRegex).min(validationRules.usernameMinLength).max(validationRules.stringMaxLength).required(),
    password: Joi.string().pattern(validationRules.passwordRegex).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).max(validationRules.stringMaxLength).required(),
});
