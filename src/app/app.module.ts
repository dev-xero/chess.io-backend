import { config, corsOptions } from '@core/config';
import express, { Request, Response } from 'express';
import { dispatch } from '../core/events/app.events';
import { appRouter } from './app.router';
import helmet from 'helmet';
import * as parser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import { NotFoundErrorHandler } from '@core/handlers';
import { HttpStatus } from '@constants/index';
import { authRouter } from './auth/auth.module';
import { ErrorHandler } from '@core/middlewares';
import { createServer } from 'http';
import { WebSocketManager } from '@core/websocket';
import { RedisClient } from '@core/providers';
import { createChallengeRouter } from './challenge/challenge.module';
import { GameService, createGameRouter } from './game';
import { ChallengeService } from './challenge';

export async function startApplication() {
    const application = express();
    const port = config.app.port;
    const notFoundHandler = new NotFoundErrorHandler();
    const errorHandler = new ErrorHandler();

    const httpServer = createServer(application);
    const redisClient = new RedisClient();
    const webSocketManager = new WebSocketManager(httpServer, redisClient);
    const gameService = new GameService(redisClient, webSocketManager);

    application.get('/', (_: Request, res: Response) => {
        res.status(HttpStatus.OK).json({
            message:
                'ChessIO backend server. Prefix routes with v1 to use the API.',
            success: true,
            code: HttpStatus.OK
        });
    });

    const challengeService = new ChallengeService(gameService);
    const challengeRouter = createChallengeRouter(challengeService);
    const gameRouter = createGameRouter(gameService);

    application.use(express.json());
    application.use(parser.urlencoded({ extended: false }));
    application.use(helmet());
    application.disable('x-powered-by');
    application.use(compression());
    application.use(cors(corsOptions));
    application.use('/v1', appRouter);
    application.use('/v1/auth', authRouter);
    application.use('/v1/challenge', challengeRouter);
    application.use('/v1/game', gameRouter);
    application.use(errorHandler.handle);
    application.use(notFoundHandler.handle);

    application.listen(port, () => dispatch('app:up'));
}
