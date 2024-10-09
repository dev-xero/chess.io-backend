import { GameModule } from '@app/game';
import { HttpStatus } from '@constants/status.codes';
import { logger } from '@core/logging';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface UserReq {
    username: string;
}

export class ChallengeService {
    constructor(private gameModule: GameModule) {}

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const user: UserReq = req.user;
            const challengeID = uuidv4();
            const duration = req.query['duration']
                ? parseInt(req.query['duration'] as string, 10)
                : 600; // 5 mins default

            await this.gameModule.createPendingGame(
                user.username,
                challengeID,
                duration
            );

            res.status(HttpStatus.CREATED).json({
                message: 'Challenge link created.',
                success: true,
                code: HttpStatus.CREATED,
                payload: {
                    link: `accept/${challengeID}`,
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
            console.log('challengeID:', challengeID);
            const acceptingUser: UserReq = req.user;

            const acceptedGame = await this.gameModule.acceptPendingGame(
                challengeID,
                acceptingUser.username
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
            logger.error('Failed to accept challenge.\nError:', err);
            next(err);
        }
    }
}
