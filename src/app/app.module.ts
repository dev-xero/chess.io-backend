import { config } from '@core/config';
import express, { Request, Response } from 'express';
import { dispatch } from './events/app.events';
import { HttpStatus } from 'src/constants';

export async function startApplication() {
    const application = express();
    const port = config.app.port;

    application.get('/', (_: Request, res: Response) => {
        res.status(HttpStatus.OK).json({
            message:
                'ChessIO backend server active. Use /health for API health.',
            success: true,
            code: HttpStatus.OK
        });
    });

    application.listen(port, () => dispatch('app:up'));
}
