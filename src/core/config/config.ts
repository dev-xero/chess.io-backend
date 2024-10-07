import * as dotenv from 'dotenv';
import { ENVIRONMENT } from '../utils';

dotenv.config();

export const config = Object.freeze({
  app: {
    port: parseInt(process.env.PORT || '8080'),
    environment: {
      mode: process.env.NODE_ENV,
      isInProduction: process.env.NODE_ENV === ENVIRONMENT.PROD,
      isInDevelopment: process.env.NODE_ENV === ENVIRONMENT.DEV,
      isInTesting: process.env.NODE_ENV === ENVIRONMENT.TEST
    },
    address:
      process.env.NODE_ENV == ENVIRONMENT.PROD
        ? process.env.REMOTE_URL
        : `http://localhost:${process.env.PORT}`
  }
});

export default config;
