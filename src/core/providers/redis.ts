import { Redis } from 'ioredis';
import { config } from '@core/config';
import { logger } from '@core/logging';

export class RedisClient {
    private client: Redis;

    constructor() {
        this.client = new Redis(config.redis.uri);

        this.client.on('connect', () => {
            logger.info('Redis client connected successfully.');
        });

        this.client.on('error', (err) => {
            logger.error('[FATAL]: Failed to connect to redis.\nError:', err);
            process.exit(1);
        });
    }
}
