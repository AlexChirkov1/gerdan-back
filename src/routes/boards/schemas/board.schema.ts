import * as Joi from 'joi';
import { validationRules } from 'src/common/validations.rules';
import { BoardTypeKeys } from '../resources/board_type_keys';

export const BoardSchema = Joi.object({
    type: Joi.string()
        .valid(...BoardTypeKeys)
        .optional(),
    backgroundColor: Joi.string()
        .regex(validationRules.colorRegex)
        .length(7)
        .optional()
        .messages({ 'string.pattern.base': 'backgroundColor should be a valid hex color with hashtag' }),
    schema: Joi.array()
        .items(Joi.object({
            x: Joi.number()
                .min(0)
                .required(),
            y: Joi.number()
                .min(0)
                .required(),
            filled: Joi.boolean()
                .required(),
            color: Joi.string()
                .regex(validationRules.colorRegex)
                .length(7)
                .optional()
                .messages({ 'string.pattern.base': 'color should be a valid hex color with hashtag' }),
            number: Joi.number()
                .min(0)
                .optional()
        }))
        .unique((prev, next) => prev.x === next.x && prev.y === next.y)
        .min(1)
        .required(),
    colormap: Joi.array()
        .items(Joi.object({
            color: Joi
                .string()
                .regex(validationRules.colorRegex)
                .length(7)
                .valid(Joi.ref('/schema', { in: true, adjust: (nodes) => nodes.map(node => node.color) }))
                .required()
                .messages({
                    'string.pattern.base': 'color should be a valid hex color with hashtag',
                    'any.only': 'color in colormap must exist in schema'
                }),
            number: Joi
                .number()
                .min(0)
                .valid(Joi.ref('/schema', { in: true, adjust: (nodes) => nodes.map(node => node.number) }))
                .required()
                .messages({
                    'any.only': 'number in colormap must exist in schema'
                })
        }))
        .unique((prev, next) => prev.color === next.color || prev.number === next.number)
        .min(1)
        .required(),
});
