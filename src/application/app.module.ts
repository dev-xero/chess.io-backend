import { config, corsOptions } from '@core/config';
import express, { Request, Response } from 'express';
import expressWs from 'express-ws';
import { appRouter } from './app.router';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { NotFoundErrorHandler } from '@core/handlers';
import { HttpStatus } from '@constants/index';
import { authRouter } from './auth/auth.module';
import { ErrorHandler } from '@core/middlewares';
import { logger } from '@/core';
// import { IncomingMessage } from 'http';
// import { ExtendedWebSocket, WebSocketManager } from '@core/websocket';
// import { GameService, createGameRouter } from './game';
// import { databaseManager, logger } from '@/core';

export async function startApplication() {
    const expressServer = express();
    const wsServer = expressWs(expressServer);
    const application = wsServer.app;
    const port = config.app.port;
    const notFoundHandler = new NotFoundErrorHandler();
    const errorHandler = new ErrorHandler();

    // Websocket and Game Manager
    // const webSocketManager = new WebSocketManager(databaseManager.RedisClient);
    // const gameService = new GameService(databaseManager.RedisClient, webSocketManager);

    // application.ws('/v1/ws', (ws: ExtendedWebSocket, req: IncomingMessage) => {
    //     webSocketManager.handleUpgrade(req, ws);
    // });

    // Middleware
    application.use(express.json());
    application.use(express.urlencoded({ extended: false }));
    application.use(helmet());
    application.disable('x-powered-by');
    application.use(compression());
    application.use(cors(corsOptions));

    // Routers
    // const challengeService = new ChallengeService(gameService);
    // const challengeRouter = createChallengeRouter(challengeService);
    // const gameRouter = createGameRouter(gameService);

    // Routes
    application.use('/v1', appRouter);
    application.use('/v1/auth', authRouter);
    // application.use('/v1/challenge', challengeRouter);
    // application.use('/v1/game', gameRouter);

    application.get('/', (_: Request, res: Response) => {
        res.status(HttpStatus.OK).json({
            message:
                'ChessIO backend server. Prefix routes with v1 to use the API.',
            success: true,
            code: HttpStatus.OK
        });
    });

    application.use(notFoundHandler.handle);
    application.use(errorHandler.handle);

    application.listen(port, () => {
        logger.info(
            `Server application started, running in [${config.app.environment.mode}] @ ${config.app.address}`
        );
    });
}
