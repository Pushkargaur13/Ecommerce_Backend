// src/middleware/metrics.ts
import { collectDefaultMetrics, Registry } from 'prom-client';
import express from 'express';

export const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });

export function metricsMiddleware(app: express.Express) {
  app.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', metricsRegistry.contentType);
    res.end(await metricsRegistry.metrics());
  });
}
