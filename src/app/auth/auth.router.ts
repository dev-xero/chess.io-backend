import { dispatch } from '@core/events/app.events';
import { HttpStatus } from '@constants/status.codes';
import { Request, Response, Router } from 'express';
import { authService } from './auth.service';

export const authRouter = Router();

authRouter.get('/register', async (req: Request, res: Response) => {
    // TODO: await registration, change this tmr
    try {
        const user = {
            username: 'ready_player_01',
            password: 'iamplayer1frfr',
            secretQuestion: 'whoareyou'
        };
        await authService.register(user);
        res.status(HttpStatus.CREATED).json({
            message: 'Player registered successfully.',
            success: true,
            code: HttpStatus.CREATED
        });
    } catch (err) {
        dispatch('app:internal:error');
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error occurred.',
            success: false,
            code: HttpStatus.INTERNAL_SERVER_ERROR
        });
    }
});
