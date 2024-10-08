import { BadRequestError } from '@core/errors';
import { Schema } from 'joi';

export const validateReqBody = (schema: Schema, obj: any) => {
    const { error } = schema.validate(obj);
    if (error) {
        throw new BadRequestError(error.message.replace(/"/g, ''));
    }
};
