// src/controllers/dashboard.controller.ts
import { Request, Response, NextFunction } from 'express';
import dashboardService from '../services/dashboard.service';

export const getDashboard = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = await dashboardService.getDashboardDataCached();
    res.json(payload);
  } catch (err) {
    next(err);
  }
};
