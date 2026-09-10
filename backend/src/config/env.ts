import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/agency-os'),
  JWT_SECRET: z.string().min(32).default('development-only-secret-change-me-now'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  XAI_API_KEY: z.string().trim().optional(),
  XAI_MODEL: z.string().trim().default('grok-4.6'),
  CRON_SECRET: z.string().trim().min(16).optional(),
  XAI_DAILY_SEARCH_BUDGET: z.coerce.number().int().positive().max(1000).default(50),
  RESEARCH_JOBS_PER_CRON: z.coerce.number().int().positive().max(10).default(3),
  RESEARCH_JOB_MAX_ATTEMPTS: z.coerce.number().int().positive().max(5).default(3),
});

export const env = schema.parse(process.env);
