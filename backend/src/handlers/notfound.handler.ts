import { NotFoundError } from '@core/errors';
import { NextFunction, Request, Response } from 'express';

export class NotFoundErrorHandler {
    handle = (req: Request, _: Response, next: NextFunction) => {
        const error = new NotFoundError(
            `request path '${req.path.replace('\\', '')}' not found for ${req.method} method.`
        );
        next(error);
    };
}
