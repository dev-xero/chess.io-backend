/**
 * Copyright (C) dev-xero 2024-2026
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
 * associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or 
 * substantial portions of the Software.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
  PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
  FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
  ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { PrismaClient } from '@/cilent';
import Redis from 'ioredis';
import { envConfig } from '../config';
import { logger } from '../logging';

/**
 * This class is responsible for managing the main database connections.
 * It creates a postgres and redis connection and handles obtaining
 * references to both objects, and disconnection.
 */
class DatabaseManager {
    private prisma: PrismaClient;
    private redis: Redis;

    constructor() {
        this.prisma = new PrismaClient();
        this.redis = new Redis(envConfig.redis.uri);
    }

    /**
     * This method will attempt to create a new postgres and redis database
     *  connection.
     */
    public async establishConnection() {
        try {
            await this.prisma.$connect().then(() => {
                logger.info('Prisma client successfully connected');
            });
            this.redis.connect(() => {
                logger.info('Redis client successfully connected');
            });
        } catch (err) {
            logger.error(
                'System failed to start database service, error: ',
                err
            );
            throw new Error('db setup failed');
        }
    }

    /** Obtains prisma client reference */
    public get PrismaClient() {
        return this.prisma;
    }

    /** Obtains redis client reference */
    public get RedisClient() {
        return this.redis;
    }

    /**
     * This method handles database disconnections.
     */
    public async disconnect() {
        try {
            await this.prisma.$disconnect();
            this.redis.disconnect();
            logger.info(
                'successfully disconnected from Prisma and Redis clients.'
            );
        } catch (err) {
            logger.info(
                'System failed to disconnect from Prisma or Redis client, error:',
                err
            );
        }
    }
}

export const databaseManager = new DatabaseManager();
