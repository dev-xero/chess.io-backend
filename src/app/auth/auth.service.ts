import { PrismaClient } from '@prisma/client';
import { IRegisterRequest } from './interfaces/i.auth.register';
import { dbProvider } from '@app/providers';

class AuthService {
    private dbClient: PrismaClient;

    constructor(client: PrismaClient) {
        this.dbClient = client;
    }

    public async register(req: IRegisterRequest) {
        console.log('registration successful');
    }

    public async login() {}

    public async logout() {}
}

export const authService = new AuthService(dbProvider.client);
