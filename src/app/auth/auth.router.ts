import { NextFunction, Request, Response, Router } from 'express';
import { authService } from './auth.service';

export const authRouter = Router();

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

authRouter.get(
    '/logout',
    async (req: Request, res: Response, next: NextFunction) => {
        await authService.logout(req, res, next);
    }
);
