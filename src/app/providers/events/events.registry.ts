import { config } from '@core/config';
import { logger } from '@core/logging';

const registry = {
    'app:up': [
        () =>
            logger.info(
                `Server started at ${config.app.address} in ${config.app.environment.mode} environment`
            )
    ],
    'event:registration:successful': [
        () => logger.info('Events listeners registered')
    ]
};

export default registry;
