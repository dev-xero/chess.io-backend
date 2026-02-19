/**
 * Copyright (C) dev-xero 2024-2026
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { logger } from '@/core';
import { HttpStatus } from '@constants/index';
import { config, corsOptions } from '@core/config';
import { NotFoundErrorHandler } from '@core/handlers';
import { ErrorHandler } from '@core/middlewares';
import compression from 'compression';
import cors from 'cors';
import express, { Request, Response } from 'express';
import expressWs, { Application } from 'express-ws';
import helmet from 'helmet';
import swaggerJSDoc from 'swagger-jsdoc';
import { appRouter } from './app.router';
import { authRouter } from './auth/auth.module';
import swaggerUi from 'swagger-ui-express';

/**
 * This method is responsible for configuring the application's endpoints,
 * endpoint swagger specifications, middleware, and listening on the configured
 * host port.
 */
export async function startApplication() {
    const expressServer = express();
    const wsServer = expressWs(expressServer);

    const application = wsServer.app;
    const port = config.app.port;

    configureMiddleware(application);
    configureOpenApi(application);
    configureEndpoints(application);

    application.listen(port, () => {
        logger.info(
            `Server application started. Running in [${config.app.environment.mode}] @ ${config.app.address}`
        );
    });
}

/**
 *
 * @param application Express application instance
 */
function configureMiddleware(application: Application) {
    application.use(express.json());
    application.use(express.urlencoded({ extended: false }));
    application.use(helmet());
    application.disable('x-powered-by');
    application.use(compression());
    application.use(cors(corsOptions));
}

/**
 * This function provides OpenAPI specifications for the present endpoints.
 *
 * @param application Express application instance
 */
function configureOpenApi(application: Application) {
    const openApiSpecs = swaggerJSDoc({
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Chess.io API Specification',
                version: '1.0.0'
            }
        },
        apis: ['./src/**/router*.ts']
    });
    application.use('/v1/docs', swaggerUi.serve, swaggerUi.setup(openApiSpecs));
}

/**
 * This function is responsible for configuring the application endpoints
 * provided by the routers.
 *
 * @param application Express application instance
 */
function configureEndpoints(application: Application) {
    const notFoundHandler = new NotFoundErrorHandler();
    const errorHandler = new ErrorHandler();

    application.get('/', (_: Request, res: Response) => {
        res.status(HttpStatus.OK).json({
            message: 'Status online, prefix routes with /v1 to use the API',
            docs: '/v1/docs',
            success: true,
            code: HttpStatus.OK
        });
    });

    application.use('/v1', appRouter);
    application.use('/v1/auth', authRouter);
    application.use(notFoundHandler.handle);
    application.use(errorHandler.handle);
}

// Dead code
//
// Websocket and Game Manager
// const webSocketManager = new WebSocketManager(databaseManager.RedisClient);
// const gameService = new GameService(databaseManager.RedisClient, webSocketManager);

// application.ws('/v1/ws', (ws: ExtendedWebSocket, req: IncomingMessage) => {
//     webSocketManager.handleUpgrade(req, ws);
// });
//
// const challengeService = new ChallengeService(gameService);
// const challengeRouter = createChallengeRouter(challengeService);
// const gameRouter = createGameRouter(gameService);
//
// application.use('/v1/challenge', challengeRouter);
// application.use('/v1/game', gameRouter);
