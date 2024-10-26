import { GameService } from '@app/game';
import { userService } from '@app/user';
import { HttpStatus } from '@constants/status.codes';
import { BadRequestError } from '@core/errors';
import { logger } from '@core/logging';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface ChallengeRequest {
    username: string;
}

export class ChallengeService {
    constructor(private gameModule: GameService) {}

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const gameReq: ChallengeRequest = req.user;
            const challengeID = uuidv4();
            const duration = req.query['duration']
                ? parseInt(req.query['duration'] as string, 10)
                : 600; // 5 mins default

            const userInfo = await userService.findUser(gameReq.username);
            if (!userInfo) {
                throw new BadRequestError(
                    'Invalid username provided, cannot create this challenge.'
                );
            }

            const challenger = {
                id: userInfo.id,
                username: userInfo.username
            };

            await this.gameModule.createPendingChallenge(
                challenger,
                challengeID,
                duration
            );

            res.status(HttpStatus.CREATED).json({
                message: 'Challenge link created.',
                success: true,
                code: HttpStatus.CREATED,
                payload: {
                    link: `accept/${userInfo.username}/${challengeID}`,
                    duration: duration,
                    expiresIn: '30mins'
                }
            });
        } catch (err) {
            logger.error('Failed to generate challenge link', err);
            next(err);
        }
    }

    public async acceptChallenge(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { challengeID } = req.params;
            const gameReq: ChallengeRequest = req.user;

            const userInfo = await userService.findUser(gameReq.username);
            if (!userInfo) {
                throw new BadRequestError(
                    'Invalid username provided, cannot accept this challenge.'
                );
            }

            const opponent = {
                id: userInfo.id,
                username: userInfo.username
            };

            try {
                const acceptedGame =
                    await this.gameModule.acceptPendingChallenge(
                        challengeID,
                        opponent
                    );

                console.log(acceptedGame);

                if (acceptedGame) {
                    res.status(HttpStatus.OK).json({
                        message: 'Challenge accepted, game created.',
                        success: true,
                        code: HttpStatus.OK,
                        payload: acceptedGame
                    });
                } else {
                    res.status(HttpStatus.NOT_FOUND).json({
                        message: 'Challenge not found or already accepted.',
                        success: false,
                        code: HttpStatus.NOT_FOUND
                    });
                }
            } catch (err) {
                logger.error(err);
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Challengers cannot accept the game.',
                    success: false,
                    code: HttpStatus.BAD_REQUEST
                });
                return;
            }
        } catch (err) {
            logger.error('Failed to accept challenge.\nError:', err);
            next(err);
        }
    }
}
