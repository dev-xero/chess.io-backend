import { UnauthorizedError } from '@core/errors';
import { NextFunction, Request, Response } from 'express';
import { JWT } from '@/utils';
import { config } from '@core/config';
import { logger } from '@core/logging';

// ! TODO: Rename 'handlers' into 'middleware'
class AuthHandler {
    public async isAuthorized(req: Request, _: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(
                new UnauthorizedError('This endpoint requires authentication.')
            );
        }

        const jwt = new JWT(config.auth.secret);
        const token = authHeader.split(' ')[1];

        let decodedToken;
        try {
            decodedToken = jwt.verifyToken(token);
            if (!decodedToken) {
                return next(
                    new UnauthorizedError(
                        'This token is expired or blacklisted.'
                    )
                );
            }
            // !TODO: Testing purposes
            console.log('here is a token:', decodedToken);
            // req.user = decodedToken;
        } catch (err) {
            logger.error(err);
            return next(new UnauthorizedError('Invalid bearer token.'));
        }

        next();
    }
}

const authHandler = new AuthHandler();
export const { isAuthorized } = authHandler;
