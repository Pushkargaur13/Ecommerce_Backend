import { Request, Response } from 'express';
import * as refreshService from '../services/refresh.service';
import { clearRefreshCookie, setRefreshCookie } from '../utils/cookie';

const REFRESH_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME ?? 'refreshToken';

export async function refresh(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const result = await refreshService.rotateRefreshToken(refreshToken);
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);

    return res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (err: any) {
    console.error('Refresh error:', err?.message ?? err);
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      await refreshService.revokeRefreshToken(refreshToken);
    }
  } catch (err) {
    console.error('Logout revoke error:', err);
  } finally {
    clearRefreshCookie(res);
    return res.status(200).json({ ok: true });
  }
}
