import { HttpStatus } from '@constants/index';
import { ApplicationError, ErrorDetailsDescriptor } from './application.error';

export class UnauthorizedError extends ApplicationError {
    _statusCode = HttpStatus.UNAUTHORIZED;
    _message: string;
    _details = null;

    constructor(message: string) {
        super(message);
        this._message = message;

        Object.setPrototypeOf(this, UnauthorizedError.prototype);
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
