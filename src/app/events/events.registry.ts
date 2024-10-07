import { config } from '@core/config';
import { logger } from '@core/logging';

const registry = {
    'app:up': [
        () =>
            logger.info(
                `Server started at ${config.app.address} in ${config.app.environment.mode} environment.`
            )
    ],
    'event:registration:successful': [
        () => logger.info('Events listeners registered.')
    ],
    'db:setup:success': [() => logger.info('Database connected successfully.')],
    'db:setup:failed': [
        (err: Error) =>
            logger.error('Database failed to connect.\nError:', err.message)
    ],
    'db:disconnected': [() => logger.warn('Database disconnected.')]
};

export default registry;
