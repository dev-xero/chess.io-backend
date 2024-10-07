import { dbProvider } from '@app/providers';
import { startApplication } from './app';
import { shutdown } from '@core/utils/shutdown';

dbProvider
    .connect()
    .then(() => startApplication())
    .catch((err) => shutdown(err));
