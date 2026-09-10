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

const utcTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use an HH:mm UTC time');

export const researchScheduleInput = liveResearchInput.extend({
  name: z.string().trim().min(2).max(120),
  timeUtc: utcTime.default('03:00'),
  enabled: z.boolean().default(true),
});

export const researchSchedulePatch = researchScheduleInput.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field is required',
);
