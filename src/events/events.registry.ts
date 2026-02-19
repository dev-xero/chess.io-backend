import { config } from '@core/config';
import { logger } from '@/logging';

const registry = {
    'app:up': [
        () =>
            logger.info(
                `Server started at ${config.app.address} in ${config.app.environment.mode} environment.`
            )
    ],
    'app:internal:error': [
        (err: Error) =>
            logger.error(
                'An internal server error occurred.\nError:',
                err.message
            )
    ],
    'auth:registered': [(user: string) => logger.info(`successfully registered new user: ${user}.`)],
    'auth:logged_out': [(user: string) => logger.info(`successfully logged out user: ${user}.`)],
    'event:registration:successful': [
        () => logger.info('Events listeners registered.')
    ],
    'db:setup:success': [() => logger.info('Database connected successfully.')],
    'db:setup:failed': [
        (err: Error) =>
            logger.error('Database failed to connect.\nError:', err)
    ],
    'db:disconnected': [() => logger.warn('Database disconnected.')],
    'game:update': [() => logger.info('Game update dispatched.')],
    'game:accepted': [
        (id: string) => logger.info(`Game with id: ${id} has been created.`)
    ],
    'game:ended': [
        (id: string, cause: string) =>
            logger.info(`Game ${id} has ended by ${cause}.`)
    ]
};

export default registry;
