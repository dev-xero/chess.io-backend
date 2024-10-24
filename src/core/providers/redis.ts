import { Redis } from 'ioredis';
import { config } from '@core/config';
import { logger } from '@core/logging';

export class RedisClient {
    private client: Redis;

    constructor() {}

    async connect() {
        this.client = new Redis(config.redis.uri);

        this.client.on('connect', () => {
            logger.info('Redis client connected successfully.');
        });

        this.client.on('error', (err) => {
            logger.error('[FATAL]: Failed to connect to redis.\nError:', err);
            process.exit(1);
        });
    }

    async hmset(key: string, data: Record<string, any>): Promise<'OK'> {
        return this.client.hmset(key, data);
    }

    async hset(key: string, field: string, value: string) {
        return this.client.hset(key, field, value);
    }

    async hgetall(key: string): Promise<Record<string, string> | null> {
        return this.client.hgetall(key);
    }

    async expire(key: string, seconds: number): Promise<number> {
        return this.client.expire(key, seconds);
    }

    async sadd(key: string, member: string): Promise<number> {
        return this.client.sadd(key, member);
    }

    async smembers(key: string): Promise<string[]> {
        return this.client.smembers(key);
    }

    async publish(channel: string, message: string): Promise<number> {
        return this.client.publish(channel, message);
    }

    async subscribe(
        channel: string,
        callback: (message: string) => void
    ): Promise<void> {
        const subscriber = this.client.duplicate();
        await subscriber.subscribe(channel);
        subscriber.on('message', (ch, message) => {
            if (ch === channel) {
                callback(message);
            }
        });
    }

    async del(key: string) {
        await this.client.del([key]);
    }

    async keys(pattern: string): Promise<string[]> {
        return this.client.keys(pattern);
    }

    // Get the value of a specific key
    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }
}
