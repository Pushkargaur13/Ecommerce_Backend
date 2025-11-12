import prisma from '../prisma/client';
import { RegisterInput, LoginInput } from '../types/auth.types';
import { hashPassword, verifyPassword } from '../utils/hash';
import { signAccessToken } from '../utils/jwt';
import { genRefreshTokenRaw, hashToken } from '../utils/crypto';

const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30);

function getRefreshExpiryDate() {
  const expiresInMs = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + expiresInMs);
}

type AuthResult = {
  user: { id: string; email: string; name?: string | null; isEmailVerified?: boolean, roles: string[]; };
  tokens: {
    accessToken: string;
    refreshToken: string; 
    refreshTokenExpiresAt: Date;
  };
};

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const { email, password, name } = input;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Email already in use');
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
    },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });

  let role = await prisma.role.findUnique({ where: { name: 'USER' } });
  if (!role) {
    role = await prisma.role.create({ data: { name: 'USER' } });
  }

  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: role.id,
    },
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshTokenRaw = genRefreshTokenRaw();
  const refreshTokenHash = hashToken(refreshTokenRaw);
  const expiresAt = getRefreshExpiryDate();

  const userRoles = user.roles.map(ur => ur.role.name);

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified,
      roles: userRoles
    },
    tokens: {
      accessToken,
      refreshToken: refreshTokenRaw,
      refreshTokenExpiresAt: expiresAt,
    },
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {roles: {include: {role: true}}}
  });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    throw new Error('Invalid credentials');
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email });

  const refreshTokenRaw = genRefreshTokenRaw();
  const refreshTokenHash = hashToken(refreshTokenRaw);
  const expiresAt = getRefreshExpiryDate();

  const userRoles = user.roles.map(ur => ur.role.name);
  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user: { id: user.id, email: user.email, name: user.name, isEmailVerified: user.isEmailVerified, roles: userRoles },
    tokens: {
      accessToken,
      refreshToken: refreshTokenRaw,
      refreshTokenExpiresAt: expiresAt,
    },
  };
}
