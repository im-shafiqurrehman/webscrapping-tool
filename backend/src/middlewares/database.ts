import type { NextFunction, Request, Response } from 'express';
import { connectDatabase } from '../config/database.js';

/** Lazily connects on Vercel and reuses the Mongoose pool on warm function invocations. */
export async function requireDatabase(_req: Request, _res: Response, next: NextFunction) {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
}
