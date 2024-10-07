import { join } from 'path';
import { createLogger, transports, format } from 'winston';
const { combine, printf, timestamp, colorize } = format;

function logFormat() {
  return printf((info: any) => {
    return `${info.timestamp} ${info.level}: ${info.stack || info.message}`;
  });
}

export function productionLogger() {
  return createLogger({
    format: combine(colorize(), timestamp(), logFormat()),
    transports: [
      new transports.File({
        filename: join(__dirname, 'serverlogs/prod.log')
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
        filename: join(__dirname, 'serverlogs/dev.log')
      })
    ]
  });
}
