import { dbProvider } from '@core/providers';
import { PrismaClient } from '@prisma/client';

class UserService {
    private dbClient: PrismaClient;

    constructor(client: PrismaClient) {
        this.dbClient = client;
    }

    public async userExists(username: string): Promise<boolean> {
        const record = await this.dbClient.player.findUnique({
            where: {
                username: username
            }
        });
        return record ? true : false;
    }
}

export const userService = new UserService(dbProvider.client);
