import { Logger } from 'winston';
import { productionLogger, developmentLogger } from './logs';

export const logger: Logger =
  process.env.NODE_ENV === 'production'
    ? productionLogger()
    : productionLogger();
