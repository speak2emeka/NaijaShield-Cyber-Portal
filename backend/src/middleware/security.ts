import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import csrf from 'csurf';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env, isProduction } from '../config/env.js';
import { logger } from '../config/logger.js';

export const requestLogger = pinoHttp({ logger });

export const corsMiddleware = cors({
  origin: env.FRONTEND_ORIGIN,
  credentials: true
});

export const globalRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: env.COOKIE_SECURE
  }
});

export function registerSecurityMiddleware(app: express.Express) {
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(corsMiddleware);
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(globalRateLimit);
  app.use(requestLogger);
}
