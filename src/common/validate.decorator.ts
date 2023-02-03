import { UsePipes } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import { JoiValidationPipe } from './joi_validation.pipe';

export const ValidateSchema = (schema: ObjectSchema) => UsePipes(new JoiValidationPipe(schema));
