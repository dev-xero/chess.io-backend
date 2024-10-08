import { IRegisterUser } from '@app/auth/interfaces/register.interface';
import { dbProvider } from '@core/providers';
import { Player, PrismaClient } from '@prisma/client';

type PlayerUpdateData = {
    password?: string;
    rating?: number;
    authToken?: string;
};

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

    public async create(newUser: IRegisterUser): Promise<Player> {
        const record = await this.dbClient.player.create({
            data: {
                username: newUser.username,
                password: newUser.password,
                secretQuestion: newUser.secretQuestion,
                rating: 1200
            }
        });
        return record;
    }

    public async update(username: string, newData: PlayerUpdateData) {
        return await this.dbClient.player.update({
            where: { username },
            data: {
                ...newData
            }
        });
    }
}

export const userService = new UserService(dbProvider.client);
