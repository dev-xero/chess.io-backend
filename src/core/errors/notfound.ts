import { HttpStatus } from '@constants/index';
import { ApplicationError, ErrorDetailsDescriptor } from './application.error';

export class NotFoundError extends ApplicationError {
    _statusCode = HttpStatus.NOT_FOUND;
    _message: string;
    _details = null;

    constructor(message: string) {
        super(message);
        this._message = message;
    }

    get statusCode(): number {
        return this._statusCode;
    }

    get message(): string {
        return this._message;
    }

    get details(): ErrorDetailsDescriptor {
        return this._details;
    }
}
