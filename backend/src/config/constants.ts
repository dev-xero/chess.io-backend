export const HttpHeadersContentType = {
    OCTECT_STREAM: 'application/octet-stream',
    JSON: 'application/json'
};

export const HttpStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    NOT_WHITELISTED: 409,
    UNPROCESSABLE: 422,
    INTERNAL_SERVER_ERROR: 500
};

export const SALT_ROUNDS = 10;
export const TOKEN_EXPIRES_IN = '1hr';
export const DEFAULT_RATING = 1200;
