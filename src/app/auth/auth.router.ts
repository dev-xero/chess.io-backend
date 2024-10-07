import { dispatch } from '@core/events/app.events';
import { HttpStatus } from '@constants/status.codes';
import { Request, Response, Router } from 'express';
import { authService } from './auth.service';

export const authRouter = Router();

authRouter.get('/register', async (req: Request, res: Response) => {
    await authService.register(req, res);
});
