import { PrismaClient } from '@prisma/client';
import { dbProvider } from '@core/providers';
import { Request, Response } from 'express';
import { HttpStatus } from '@constants/index';
import { dispatch } from '@core/events/app.events';
import { IRegisterUser } from './interfaces/register.interface';

class AuthService {
    private dbClient: PrismaClient;

    constructor(client: PrismaClient) {
        this.dbClient = client;
    }

    public async register(req: Request, res: Response) {
        // extract payload from request
        const user: IRegisterUser = req.body;
        try {
            // TODO: actual data processing
            

            dispatch('auth:registered');
            res.status(HttpStatus.CREATED).json({
                message: 'Player registered successfully.',
                success: true,
                code: HttpStatus.CREATED
            });
        } catch {
            dispatch('app:internal:error');
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error occurred.',
                success: false,
                code: HttpStatus.INTERNAL_SERVER_ERROR
            });
        }
    }

    public async login() {}

    public async logout() {}
}

export const authService = new AuthService(dbProvider.client);
