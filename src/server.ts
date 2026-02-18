import { databaseManager } from '@core/providers';
import { shutdown } from '@core/utils/shutdown';
import { startApplication } from './application';

async function startServer() {
    try {
        await databaseManager.establishConnection();
        startApplication();
    } catch (ex) {
        shutdown(ex);
    }
}

startServer();
