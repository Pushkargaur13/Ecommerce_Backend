import prisma from '../prisma/client';
import { genRefreshTokenRaw, hashToken } from '../utils/crypto';
import { signAccessToken } from '../utils/jwt';

const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30);

function getRefreshExpiryDate() {
  const expiresInMs = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + expiresInMs);
}

export async function rotateRefreshToken(oldRefreshRaw: string) {
  if (!oldRefreshRaw) throw new Error('No refresh token provided');

  const oldHash = hashToken(oldRefreshRaw);
  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash: oldHash },
    include: { user: true },
  });

  if (!existing || existing.revoked) {
    throw new Error('Invalid refresh token');
  }

  if (existing.expiresAt && existing.expiresAt.getTime() < Date.now()) {
    await prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revoked: true },
    });
    throw new Error('Refresh token expired');
  }

  const user = existing.user;
  if (!user) throw new Error('Invalid token: no associated user');

  const newRefreshRaw = genRefreshTokenRaw();
  const newHash = hashToken(newRefreshRaw);
  const newExpiresAt = getRefreshExpiryDate();

  const created = await prisma.refreshToken.create({
    data: {
      tokenHash: newHash,
      userId: user.id,
      expiresAt: newExpiresAt,
    },
  });

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revoked: true, replacedById: created.id },
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email });

  return {
    accessToken,
    refreshToken: newRefreshRaw,
    refreshTokenExpiresAt: newExpiresAt,
    user: { id: user.id, email: user.email, name: user.name },
  };
}

export async function revokeRefreshToken(refreshRaw: string) {
  if (!refreshRaw) return;
  const h = hashToken(refreshRaw);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash: h } });
  if (!existing) return;
  await prisma.refreshToken.update({ where: { id: existing.id }, data: { revoked: true } });
}

export async function revokeAllUserRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}
