import crypto from 'crypto';
import argon2 from 'argon2';
import speakeasy from 'speakeasy';
import { AuthTokenType } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { HttpError, assertFound } from '../utils/http.js';
import { emailTemplates, sendEmail } from './email.service.js';

function hash(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function createToken(userId: string, type: AuthTokenType, minutes: number) {
  const token = crypto.randomBytes(32).toString('hex');
  await prisma.authToken.create({
    data: {
      userId,
      type,
      tokenHash: hash(token),
      expiresAt: new Date(Date.now() + minutes * 60_000)
    }
  });
  return token;
}

export const securityService = {
  async requestEmailVerification(email: string) {
    const user = assertFound(await prisma.user.findUnique({ where: { email } }));
    const token = await createToken(user.id, AuthTokenType.EMAIL_VERIFICATION, 60 * 24);
    const url = `${env.FRONTEND_ORIGIN}/verify-email?token=${token}`;
    await sendEmail(user.email, emailTemplates.verifyEmail(url));
    return { ok: true };
  },

  async verifyEmail(token: string) {
    const record = assertFound(await prisma.authToken.findUnique({ where: { tokenHash: hash(token) } }));
    if (record.type !== AuthTokenType.EMAIL_VERIFICATION || record.usedAt || record.expiresAt < new Date()) throw new HttpError(400, 'Invalid or expired token');
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
      prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })
    ]);
    return { ok: true };
  },

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { ok: true };
    const token = await createToken(user.id, AuthTokenType.PASSWORD_RESET, 30);
    const url = `${env.FRONTEND_ORIGIN}/reset-password?token=${token}`;
    await sendEmail(user.email, emailTemplates.resetPassword(url));
    return { ok: true };
  },

  async resetPassword(token: string, password: string) {
    const record = assertFound(await prisma.authToken.findUnique({ where: { tokenHash: hash(token) } }));
    if (record.type !== AuthTokenType.PASSWORD_RESET || record.usedAt || record.expiresAt < new Date()) throw new HttpError(400, 'Invalid or expired token');
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await argon2.hash(password) } }),
      prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })
    ]);
    return { ok: true };
  },

  async setupTotp(userId: string) {
    const secret = speakeasy.generateSecret({ name: `NaijaShield:${userId}` });
    await prisma.user.update({ where: { id: userId }, data: { mfaSecret: secret.base32 } });
    return { secret: secret.base32, otpauthUrl: secret.otpauth_url };
  },

  async verifyTotp(userId: string, token: string) {
    const user = assertFound(await prisma.user.findUnique({ where: { id: userId } }));
    if (!user.mfaSecret) throw new HttpError(400, 'MFA has not been initialized');
    const verified = speakeasy.totp.verify({ secret: user.mfaSecret, encoding: 'base32', token, window: 1 });
    if (!verified) throw new HttpError(400, 'Invalid MFA token');
    await prisma.user.update({ where: { id: userId }, data: { mfaEnabled: true } });
    return { ok: true };
  },

  async sessions(userId: string) {
    return prisma.userSession.findMany({ where: { userId }, orderBy: { lastSeenAt: 'desc' } });
  }
};
