// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ message: 'Not Found' });
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = err?.status || 500;
  const message = err?.message || 'Internal Server Error';

  // Log error with request context
  req.log?.error({ err, url: req.originalUrl, body: req.body, params: req.params }, 'Unhandled error');

  // Don't leak stack in production
  const payload: any = { message };
  if (process.env.NODE_ENV !== 'production') payload.stack = err?.stack;

  res.status(status).json(payload);
}
