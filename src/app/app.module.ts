import { config } from '@core/config';
import express from 'express';
import { dispatch } from './events/app.events';

export async function startApplication() {
    const application = express();
    const port = config.app.port;

    application.listen(port, () => dispatch('app:up'));
}
