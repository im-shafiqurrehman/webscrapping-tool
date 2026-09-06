import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} was not found`));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res
      .status(422)
      .json({ error: { message: 'Validation failed', details: error.flatten() } });
  }
  if (error instanceof AppError) {
    return res
      .status(error.statusCode)
      .json({ error: { message: error.message, details: error.details } });
  }
  const err = error as Error & { code?: number };
  if (err.code === 11000)
    return res.status(409).json({ error: { message: 'A matching record already exists' } });
  console.error(err);
  return res.status(500).json({ error: { message: 'Internal server error' } });
}
