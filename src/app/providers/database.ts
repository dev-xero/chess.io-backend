import { dispatch } from '@app/events/app.events';
import { PrismaClient } from '@prisma/client';

class DatabaseProvider {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
        this.connect();
    }

    public async connect() {
        try {
            await this.prisma.$connect();
            dispatch('db:setup:success');
        } catch (error) {
            dispatch('db:setup:failed', error);
            throw new Error('db setup failed.');
        }
    }

    public get client() {
        return this.prisma;
    }

    public async disconnect() {
        await this.prisma.$disconnect();
        dispatch('db:disconnected');
    }
}

export const dbProvider = new DatabaseProvider();
