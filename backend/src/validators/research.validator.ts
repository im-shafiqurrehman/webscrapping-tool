import { z } from 'zod';

export const liveResearchInput = z.object({
  market: z.object({
    city: z.string().trim().min(2).max(100),
    region: z.string().trim().min(2).max(100),
    country: z.string().trim().min(2).max(100),
    area: z.string().trim().max(100).optional(),
  }),
  industry: z.string().trim().min(2).max(100),
  niche: z.string().trim().min(2).max(100),
  limit: z.number().int().min(1).max(20).default(10),
});
