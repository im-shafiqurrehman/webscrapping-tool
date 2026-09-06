import type { NextFunction, Request, Response } from 'express';

function stripUnsafeMongoKeys(value: unknown, seen = new WeakSet<object>()): void {
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((item) => stripUnsafeMongoKeys(item, seen));
    return;
  }
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete record[key];
      continue;
    }
    stripUnsafeMongoKeys(record[key], seen);
  }
}

/** Express 5-safe NoSQL injection protection; mutates parsed objects without replacing req.query. */
export function sanitizeRequest(req: Request, _res: Response, next: NextFunction) {
  stripUnsafeMongoKeys(req.body);
  stripUnsafeMongoKeys(req.params);
  stripUnsafeMongoKeys(req.query);
  next();
}
