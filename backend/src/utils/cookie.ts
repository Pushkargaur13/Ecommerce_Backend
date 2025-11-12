import { Response } from 'express';

const REFRESH_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME ?? 'refreshToken';
const NODE_ENV = process.env.NODE_ENV ?? 'development';

const cookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === 'production', 
  sameSite: 'lax' as const,         
  path: '/' as const,
};

export function setRefreshCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...cookieOptions,
    expires: expiresAt,
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);
}