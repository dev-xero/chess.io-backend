/**
 * Chess.io backend, 2024 - 2026.
 * github.com/dev-xero/chess.io-backend
 * MIT licensed
 */
import { join } from 'path';
import { createLogger, transports, format } from 'winston';
const { combine, printf, timestamp, colorize } = format;

import root from 'app-root-path';

function logFormat() {
    return printf((info) => {
        return `${info.timestamp} ${info.level}: ${info.stack || info.message}`;
    });
}

export function productionLogger() {
    return createLogger({
        format: combine(colorize(), timestamp(), logFormat()),
        transports: [
            new transports.Console(),
            new transports.File({
                filename: join(root.toString(), 'logs/prod.log')
            })
        ]
    });
}

export function developmentLogger() {
    return createLogger({
        format: combine(colorize(), timestamp(), logFormat()),
        transports: [
            new transports.Console(),
            new transports.File({
                filename: join(root.toString(), 'logs/dev.log')
            })
        ]
    });
}
