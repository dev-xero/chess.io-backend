import { config } from '@core/config';
import { logger } from '@core/logging';

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
    'auth:registered': [() => logger.info('successfully registered new user.')],
    'auth:logged_out': [() => logger.info('successfully logged out a user.')],
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
    'game:started': [
        (id: string) => logger.info(`A new game has started. ID: ${id}`)
    ],
    'game:ended': [
        (id: string, cause: string) =>
            logger.info(`Game ${id} has ended by ${cause}`)
    ]
};

export default registry;
