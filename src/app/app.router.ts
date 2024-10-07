import { Request, Response, Router } from 'express';
import { HttpStatus } from 'src/constants';

export const appRouter = Router();

appRouter.get('/health', (_: Request, res: Response) => {
    res.status(HttpStatus.OK).json({
        message: 'API ok, all systems healthy.',
        version: '1.0',
        code: HttpStatus.OK
    });
});
