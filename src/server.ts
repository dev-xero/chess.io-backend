import { dbProvider } from '@core/providers';
import { shutdown } from '@core/utils/shutdown';
import { startApplication } from './application';

dbProvider
    .connect()
    .then(() => {
        startApplication();
    })
    .catch((err) => shutdown(err));
