import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { setRefreshCookie } from '../utils/cookie';

export async function register(req: Request, res: Response) {
  try {
    const parsed = registerSchema.parse(req.body);
    const result = await authService.registerUser(parsed); 

    setRefreshCookie(res, result.tokens.refreshToken, result.tokens.refreshTokenExpiresAt);

    return res.status(201).json({
      user: result.user,
      accessToken: result.tokens.accessToken,
    });
  } catch (err: any) {
    if (err.message === 'Email already in use') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.parse(req.body);
    const result = await authService.loginUser(parsed);

    setRefreshCookie(res, result.tokens.refreshToken, result.tokens.refreshTokenExpiresAt);

    return res.status(200).json({
      user: result.user,
      accessToken: result.tokens.accessToken,
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    console.error(err);
    return res.status(401).json({ error: err.message ?? 'Invalid credentials' });
  }
}
