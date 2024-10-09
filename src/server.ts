import { dbProvider } from '@core/providers';
import { shutdown } from '@core/utils/shutdown';
import { startApplication } from './app';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

dbProvider
    .connect()
    .then(() => {
        startApplication();
    })
    .catch((err) => shutdown(err));
