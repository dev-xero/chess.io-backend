import { BadRequestError } from '@core/errors';
import { dispatch } from '@core/events';
import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { userService } from '@app/user';
import { HttpStatus } from '@constants/index';
import { IRegisterUser } from './interfaces/register.interface';
import { joiValidate } from '@core/utils/validator';
import { registerRequestBody } from '@core/schemas';
import { dbProvider } from '@core/providers';

class AuthService {
    private dbClient: PrismaClient;

    constructor(client: PrismaClient) {
        this.dbClient = client;
    }

    public async register(req: Request, res: Response, next: NextFunction) {
        const body: IRegisterUser = req.body;
        try {
            joiValidate(registerRequestBody, body);

            const duplicate = await userService.userExists(body.username);
            if (!duplicate)
                throw new BadRequestError('This user already exists.');

            dispatch('auth:registered');
            res.status(HttpStatus.CREATED).json({
                message: 'Player registered successfully.',
                success: true,
                code: HttpStatus.CREATED
            });
        } catch (err) {
            dispatch('app:internal:error', [err]);
            next(err);
        }
    }

    public async login() {}

    public async logout() {}
}

export const authService = new AuthService(dbProvider.client);
