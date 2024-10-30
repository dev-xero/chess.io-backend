import { IRegisterUser } from '@app/auth/interfaces/register.interface';
import { logger } from '@core/logging';
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
        try {
            const record = await this.dbClient.player.findUnique({
                where: {
                    username: username
                }
            });
            return record ? true : false;
        } catch (err) {
            logger.error(err);
            throw new Error(
                'Failed to complete this request, try again shortly.'
            );
        }
    }

    public async findUser(username: string): Promise<Player | null> {
        try {
            const record = await this.dbClient.player.findUnique({
                where: {
                    username: username
                }
            });
            return record;
        } catch (err) {
            logger.error(err);
            throw new Error(
                'Failed to complete this request, try again shortly.'
            );
        }
    }

    public async create(newUser: IRegisterUser): Promise<Player> {
        try {
            const record = await this.dbClient.player.create({
                data: {
                    username: newUser.username,
                    password: newUser.password,
                    secretQuestion: newUser.secretQuestion,
                    authToken: newUser.authToken,
                    rating: 1200
                }
            });
            return record;
        } catch (err) {
            logger.error(err);
            throw new Error(
                'Failed to complete this request, try again shortly.'
            );
        }
    }

    public async update(username: string, newData: PlayerUpdateData) {
        try {
            return await this.dbClient.player.update({
                where: { username },
                data: {
                    ...newData
                }
            });
        } catch (err) {
            logger.error(err);
            throw new Error(
                'Failed to complete this request, try again shortly.'
            );
        }
    }
}

export const userService = new UserService(dbProvider.client);
