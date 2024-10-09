import { isAuthorized } from '@core/middlewares';
import { NextFunction, Request, Response, Router } from 'express';

export const challengeRouter = Router();

challengeRouter.post(
    '/generate',
    isAuthorized,
    async (req: Request, res: Response, next: NextFunction) => {
        res.json({ message: 'yay!' });
    }
);
