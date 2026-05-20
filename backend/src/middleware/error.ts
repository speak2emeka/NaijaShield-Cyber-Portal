import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { HttpError } from '../utils/http.js';

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.path}`));
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: { message: 'Validation failed', code: 'VALIDATION_FAILED' },
      details: error.flatten()
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      error: { message: error.message, code: error.statusCode >= 500 ? 'SERVER_ERROR' : 'REQUEST_ERROR' },
      details: error.details
    });
  }

  logger.error({ error, path: req.path }, 'Unhandled request error');
  return res.status(500).json({ error: { message: 'Internal server error', code: 'SERVER_ERROR' } });
}
