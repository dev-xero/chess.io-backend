import { Request, Response, NextFunction, Router } from 'express';
import { GameService } from './game.service';
import { isAuthorized } from '@core/middlewares';
import { HttpStatus } from '@constants/status.codes';
import { logger } from '@core/logging';
import { ApplicationError, BadRequestError } from '@core/errors';

export function createGameRouter(gameService: GameService) {
    const gameRouter = Router();

    gameRouter.post(
        '/move/:gameID',
        isAuthorized,
        async (req: Request, res: Response, next: NextFunction) => {
            const { gameID } = req.params;

            if (!gameID) {
                throw new BadRequestError('Game ID must be attached.');
            }

            try {
                const { move, playerID } = req.body;
                const gameData = await gameService.makeMove(
                    gameID,
                    playerID,
                    move
                );
                res.status(HttpStatus.OK).json({
                    message: 'Completed game move.',
                    success: true,
                    code: HttpStatus.OK,
                    game: gameData
                });
            } catch (err) {
                if (err instanceof ApplicationError) {
                    next(err);
                } else {
                    res.status(HttpStatus.UNPROCESSABLE).json({
                        message:
                            'This request could not be completed, invalid game state.',
                        success: false,
                        code: HttpStatus.UNPROCESSABLE
                    });
                }
            }
        }
    );

    gameRouter.get(
        '/state/:gameID',
        isAuthorized,
        async (req: Request, res: Response, next: NextFunction) => {
            const { gameID } = req.params;

            if (!gameID) {
                throw new BadRequestError('Game ID must be attached.');
            }

            try {
                const gameData = await gameService.getFullGameData(gameID);
                res.status(HttpStatus.OK).json({
                    message: 'Completed game data request.',
                    success: true,
                    code: HttpStatus.OK,
                    game: gameData
                });
            } catch (err) {
                logger.error(err);
                if (err instanceof ApplicationError) {
                    next(err);
                } else {
                    res.status(HttpStatus.UNPROCESSABLE).json({
                        message:
                            'This request could not be completed, invalid game state.',
                        success: false,
                        code: HttpStatus.UNPROCESSABLE
                    });
                }
            }
        }
    );

    return gameRouter;
}
