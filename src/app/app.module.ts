import { config, corsOptions } from '@core/config';
import express, { Request, Response } from 'express';
import { dispatch } from './events/app.events';
import { appRouter } from './app.router';
import helmet from 'helmet';
import * as parser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import { NotFoundErrorHandler } from '@core/handlers';
import { HttpStatus } from '@constants/index';

export async function startApplication() {
    const application = express();
    const port = config.app.port;
    const errorHandler = new NotFoundErrorHandler();

    application.get('/', (_: Request, res: Response) => {
        res.status(HttpStatus.OK).json({
            message:
                'ChessIO backend server. Prefix routes with v1 to use the API.',
            success: true,
            code: HttpStatus.OK
        });
    });

    application.use(express.json());
    application.use(parser.urlencoded({ extended: false }));
    application.use(helmet());
    application.disable('x-powered-by');
    application.use(compression());
    application.use(cors(corsOptions));
    application.use('/v1', appRouter);
    application.use(errorHandler.handle);

    application.listen(port, () => dispatch('app:up'));
}
