import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

export type Role = 'admin' | 'researcher' | 'sales';
export interface AuthRequest extends Request {
  user?: { id: string; role: Role };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  if (!token) return next(new AppError(401, 'Authentication required'));
  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as { id: string; role: Role };
    return next();
  } catch {
    return next(new AppError(401, 'Invalid or expired token'));
  }
}

export const authorize =
  (...roles: Role[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role))
      return next(new AppError(403, 'Insufficient permissions'));
    return next();
  };
