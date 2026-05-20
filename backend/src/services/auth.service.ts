import argon2 from 'argon2';
import { Response } from 'express';
import { UserRole } from '@prisma/client';
import { env, isProduction } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http.js';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';

const cookieName = 'ns_refresh';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    domain: env.COOKIE_DOMAIN === 'localhost' ? undefined : env.COOKIE_DOMAIN,
    path: '/auth/refresh',
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  };
}

function publicUser(user: { id: string; email: string; name: string; role: UserRole; clientCompanyId: string | null }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    clientCompanyId: user.clientCompanyId
  };
}

async function issueTokens(user: { id: string; email: string; name: string; role: UserRole; clientCompanyId: string | null }, res: Response, userAgent?: string, ipAddress?: string) {
  const payload = { sub: user.id, email: user.email, role: user.role, clientCompanyId: user.clientCompanyId };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      userAgent,
      ipAddress,
      expiresAt
    }
  });

  res.cookie(cookieName, refreshToken, refreshCookieOptions());
  return { accessToken, user: publicUser(user) };
}

export const authService = {
  async register(input: { name: string; email: string; password: string; companyName: string; industry: string; size: string }, res: Response, userAgent?: string, ipAddress?: string) {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) throw new HttpError(409, 'Email is already registered');

    const passwordHash = await argon2.hash(input.password);
    const shieldStart = await prisma.plan.findUnique({ where: { slug: 'shield-start' } });
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        role: UserRole.CLIENT,
        clientCompany: {
          create: {
            name: input.companyName,
            industry: input.industry,
            size: input.size,
            contactEmail: input.email.toLowerCase(),
            productPlanId: shieldStart?.id,
            subscription: {
              create: {
                plan: 'ShieldStart',
                planId: shieldStart?.id,
                status: 'TRIAL',
                startDate: new Date(),
                renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              }
            }
          }
        }
      },
      select: { id: true, email: true, name: true, role: true, clientCompanyId: true }
    });

    return issueTokens(user, res, userAgent, ipAddress);
  },

  async login(email: string, password: string, res: Response, userAgent?: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new HttpError(401, 'Invalid email or password');
    }
    return issueTokens(user, res, userAgent, ipAddress);
  },

  async refresh(refreshToken: string | undefined, res: Response, userAgent?: string, ipAddress?: string) {
    if (!refreshToken) throw new HttpError(401, 'Missing refresh token');
    const payload = verifyRefreshToken(refreshToken);
    const existing = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(refreshToken) } });
    if (!existing || existing.revokedAt || existing.expiresAt < new Date()) throw new HttpError(401, 'Refresh token expired');

    await prisma.refreshToken.update({ where: { id: existing.id }, data: { revokedAt: new Date() } });
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, clientCompanyId: true }
    });
    return issueTokens(user, res, userAgent, ipAddress);
  },

  async logout(refreshToken: string | undefined, res: Response) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() }
      });
    }
    res.clearCookie(cookieName, refreshCookieOptions());
    return { ok: true };
  }
};
