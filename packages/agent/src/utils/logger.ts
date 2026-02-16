import winston from 'winston';
import path from 'node:path';

const LOG_DIR = process.env.GETACLAW_LOG_DIR ?? '/var/log/getaclaw';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'getaclaw-agent' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length > 1 ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp as string} [${level}]: ${message as string}${metaStr}`;
        }),
      ),
    }),
  ],
});

export function enableFileLogging(): void {
  logger.add(
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
    }),
  );
  logger.add(
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'agent.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  );
}
