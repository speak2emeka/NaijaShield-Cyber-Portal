import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { env } from '../config/env.js';

export type JwtUser = {
  sub: string;
  email: string;
  role: UserRole;
  clientCompanyId?: string | null;
};

export function signAccessToken(payload: JwtUser) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL } as jwt.SignOptions);
}

export function signRefreshToken(payload: JwtUser) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d` } as jwt.SignOptions);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtUser;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtUser;
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
