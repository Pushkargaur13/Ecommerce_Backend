// src/middleware/security.ts
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import express from 'express';

export function securityMiddlewares(app: express.Express) {
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
}
