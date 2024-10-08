import { dbProvider } from '@core/providers';
import { shutdown } from '@core/utils/shutdown';
import { startApplication } from './app';

dbProvider
    .connect()
    .then(() => {
        startApplication();
    })
    .catch((err) => shutdown(err));
