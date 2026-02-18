import { PrismaClient } from '@generated/cilent';
import { logger } from '../logging';
import Redis from 'ioredis';
import { config } from '../config';

class DatabaseManager {
    private prisma: PrismaClient;
    private redis: Redis;

    constructor() {
        this.prisma = new PrismaClient();
        this.redis = new Redis(config.redis.uri);
    }

    /**
     * This method will attempt to create a new postgres and redis database
     *  connection. 
     */
    public async establishConnection() {
        try {
            await this.prisma.$connect().then(() => {
                logger.info('Prisma client successfully connected.');
            });
            this.redis.connect(() => {
                logger.info('Redis client successfully connected.');
            });
        } catch (err) {
            logger.error(
                'System failed to start database service, error: ',
                err
            );
            throw new Error('db setup failed.');
        }
    }

    public get PrismaClient() {
        return this.prisma;
    }

    public get RedisClient() {
        return this.redis;
    }

    public async disconnect() {
        try {
            await this.prisma.$disconnect();
            this.redis.disconnect();
            logger.info(
                'successfully disconnected from Prisma and Redis clients.'
            );
        } catch (ex) {
            logger.info(
                'System failed to disconnect from Prisma or Redis client, error:',
                ex
            );
        }
    }
}

export const databaseManager = new DatabaseManager();
