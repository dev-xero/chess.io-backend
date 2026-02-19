import { NextFunction, Request, Response, Router } from 'express';
import { authService } from './auth.service';

export const authRouter = Router();

/**
 * @openapi
 * /:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
authRouter.post(
    '/register',
    async (req: Request, res: Response, next: NextFunction) => {
        await authService.register(req, res, next);
    }
);

authRouter.post(
    '/login',
    async (req: Request, res: Response, next: NextFunction) => {
        await authService.login(req, res, next);
    }
);

authRouter.post(
    '/reset-password',
    async (req: Request, res: Response, next: NextFunction) => {
        await authService.resetPassword(req, res, next);
    }
);

authRouter.get(
    '/logout',
    async (req: Request, res: Response, next: NextFunction) => {
        await authService.logout(req, res, next);
    }
);
