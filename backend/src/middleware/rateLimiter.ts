// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { RequestHandler } from 'express';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST ?? '127.0.0.1'}:${process.env.REDIS_PORT ?? 6379}`;

// Try to init redis client; if it fails, fallback to in-memory store (rate-limit has default memory store)
let redisClient: Redis | null = null;
if (process.env.REDIS_DISABLED !== 'true') {
  try {
    redisClient = new Redis(redisUrl, { maxRetriesPerRequest: 1 });
    redisClient.on('error', (err) => logger.warn({ err }, 'Redis error in rate limiter'));
  } catch (err) {
    logger.warn({ err }, 'Failed to connect redis for rate limiter; falling back to memory store');
    redisClient = null;
  }
}

// Configure limiter
export function createGlobalRateLimiter() {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000); // 1 minute
  const max = Number(process.env.RATE_LIMIT_MAX ?? 60); // requests per window per IP

  const opts: any = {
    windowMs,
    max,
    standardHeaders: true, // return rate limit info in headers
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ message: 'Too many requests, please try again later.' });
    },
  };

  if (redisClient) {
    opts.store = new RedisStore({
      sendCommand: (...args: any[]) => (redisClient as any).call(...args), // ioredis compatible
    });
  }

  return rateLimit(opts);
}

// Optional stricter limiter for auth endpoints
export function createAuthRateLimiter(): RequestHandler {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many login attempts from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });
}
