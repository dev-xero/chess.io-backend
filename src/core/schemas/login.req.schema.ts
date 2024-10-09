import Joi from 'joi';

export const loginReqBody = Joi.object({
    username: Joi.string().alphanum().min(4).max(24).required(),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
});