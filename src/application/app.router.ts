import { HttpStatus } from '@constants/index';
import { Request, Response, Router } from 'express';

export const appRouter = Router();

appRouter.get('/', (_: Request, res: Response) => {
    res.status(HttpStatus.OK).json({
        message: 'API v1 active.',
        code: HttpStatus.OK
    });
});

appRouter.get('/health', (_: Request, res: Response) => {
    res.status(HttpStatus.OK).json({
        message: 'API ok, all systems healthy.',
        version: '1.0',
        code: HttpStatus.OK
    });
});
