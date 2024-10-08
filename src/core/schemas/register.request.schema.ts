import Joi from 'joi';

export const registerRequestBody = Joi.object({
    username: Joi.string().alphanum().min(4).max(24).required(),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
    secretQuestion: Joi.string().min(8).max(48).required()
});
