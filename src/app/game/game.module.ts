import { Request, Response, NextFunction, Router } from 'express';
import { GameService } from './game.service';
import { isAuthorized } from '@core/middlewares';
import { HttpStatus } from '@constants/status.codes';
import { logger } from '@core/logging';
import { ApplicationError, BadRequestError } from '@core/errors';

export function createGameRouter(gameService: GameService) {
    const gameRouter = Router();

    gameRouter.get(
        '/challenge/:challengeID',
        isAuthorized,
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { challengeID } = req.params;
                const state = await gameService.getChallengeState(challengeID);

                res.status(HttpStatus.OK).json(state);
            } catch (err) {
                logger.error(err);
                if (err instanceof ApplicationError) {
                    next(err);
                } else {
                    res.status(HttpStatus.UNPROCESSABLE).json({
                        message: 'Unable to complete this request.',
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
