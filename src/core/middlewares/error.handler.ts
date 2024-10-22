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
        let message = 'An internal server error occurred.';

        if (error instanceof ApplicationError) {
            // logger.error('Error in middleware', error);
            statusCode = error._statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
            message = error._message || message;
        }

        if (statusCode == HttpStatus.INTERNAL_SERVER_ERROR) logger.error(error);

        res.status(statusCode).send({
            error:
                process.env.NODE_ENV === 'production' ? message : error.message,
            success: false,
            code: statusCode,
            endpoint: req.url.trim(),
            method: req.method,
            timestamp: new Date().toISOString()
        });
    };
}
