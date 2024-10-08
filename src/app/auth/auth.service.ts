import { BadRequestError } from '@core/errors';
import { dispatch } from '@core/events';
import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { userService } from '@app/user';
import { HttpStatus, TOKEN_EXPIRES_IN } from '@constants/index';
import { IRegisterUser } from './interfaces/register.interface';
import { joiValidate } from '@core/utils/validator';
import { registerRequestBody } from '@core/schemas';
import { JWT, encryption, omitFields } from '@core/utils';
import { config } from '@core/config';

class AuthService {
    private tokens: JWT;

    constructor() {
        this.tokens = new JWT(config.auth.secret);
    }

    public async register(req: Request, res: Response, next: NextFunction) {
        const body: IRegisterUser = req.body;
        try {
            joiValidate(registerRequestBody, body);

            const duplicate = await userService.userExists(body.username);
            if (duplicate) {
                throw new BadRequestError('This user already exists.');
            }

            body.password = encryption.encrypt(body.password);

            const newUser = await userService.create(body);
            const authToken = this.tokens.generateToken({
                id: newUser.id,
                username: newUser.username
            });

            const updatedUser = await userService.update(newUser.username, {
                authToken
            });

            dispatch('auth:registered');

            res.status(HttpStatus.CREATED).json({
                message: 'Player registered successfully.',
                success: true,
                code: HttpStatus.CREATED,
                payload: {
                    user: omitFields(updatedUser, [
                        'password',
                        'secretQuestion',
                        'authToken'
                    ]),
                    auth: {
                        token: authToken,
                        expiresIn: TOKEN_EXPIRES_IN
                    }
                }
            });
        } catch (err) {
            dispatch('app:internal:error', [err]);
            next(err);
        }
    }

    public async login() {}

    public async logout() {}
}

export const authService = new AuthService();
