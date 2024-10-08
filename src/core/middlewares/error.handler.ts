import { HttpStatus } from '@constants/index';
import { ApplicationError } from '@core/errors';
import { logger } from '@core/logging';
import { Request, Response, NextFunction } from 'express';

export class ErrorHandler {
    handle = async (
        error: Error,
        req: Request,
        res: Response,
        _: NextFunction
    ) => {
        let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'internal server error';

        if (error instanceof ApplicationError) {
            logger.error('Error in middleware', error);
            statusCode = error.statusCode;
            message = error.message;
        }

        if (statusCode == HttpStatus.INTERNAL_SERVER_ERROR) logger.error(error);

        res.status(statusCode).send({
            status: false,
            error: message,
            endpoint: req.url.trim(),
            method: req.method,
            timestamp: new Date().toDateString()
        });
    };
}
