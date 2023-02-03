import * as Joi from 'joi';
import { validationRules } from 'src/common/validations.rules';

export const UserSchema = Joi.object({
    firstName: Joi.string().pattern(validationRules.usernameRegex).max(validationRules.stringMaxLength),
    lastName: Joi.string().pattern(validationRules.usernameRegex).max(validationRules.stringMaxLength),
    username: Joi.string().pattern(validationRules.usernameRegex).max(validationRules.stringMaxLength),
    password: Joi.string().pattern(validationRules.passwordRegex),
    email: Joi.string().email({ minDomainSegments: 2 }).max(validationRules.stringMaxLength),
});
