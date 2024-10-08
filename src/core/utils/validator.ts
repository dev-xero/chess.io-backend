import { BadRequestError } from '@core/errors';
import { Schema } from 'joi';

export const joiValidate = (schema: Schema, obj: any) => {
    const { error } = schema.validate(obj);
    if (error) {
        throw new BadRequestError(error.message);
    }
};
