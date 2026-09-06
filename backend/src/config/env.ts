import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/agency-os'),
  JWT_SECRET: z.string().min(32).default('development-only-secret-change-me-now'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

export const env = schema.parse(process.env);
