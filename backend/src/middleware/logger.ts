// src/middleware/logger.ts
import pino from 'pino';
import pinoHttp from 'pino-http';

const isDev = process.env.NODE_ENV !== 'production';

// Create main app logger
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      }
    : undefined,
});

// Create HTTP request logger middleware
export const requestLogger = pinoHttp({
  logger, // ✅ this is valid — pinoHttp accepts it
  genReqId: (req, res) => {
    const existing = req.headers['x-request-id'];
    if (existing) return existing as string;
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  },
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        headers: req.headers,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
