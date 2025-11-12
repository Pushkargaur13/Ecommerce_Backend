import crypto from 'crypto';

export function genRefreshTokenRaw(bytes = 48) {
  return crypto.randomBytes(bytes).toString('hex'); 
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
