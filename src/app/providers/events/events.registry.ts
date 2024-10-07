import { config } from '@core/config';

const registry = {
  'app:up': [
    () =>
      logger.info(
        `Server started at ${config.app.address} in ${config.app.environment.mode} environment`
      )
  ]
};

export default registry;
