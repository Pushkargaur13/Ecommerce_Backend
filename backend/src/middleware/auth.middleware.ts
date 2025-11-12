import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export type AuthPayload = {
  sub: string;
  email?: string;
  roles?: string[]; 
  iat?: number;
  exp?: number;
  [k: string]: any;
};

export type AuthRequest = Request & { user?: AuthPayload };

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const payload = verifyAccessToken(token) as AuthPayload;
    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    req.user = payload;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}