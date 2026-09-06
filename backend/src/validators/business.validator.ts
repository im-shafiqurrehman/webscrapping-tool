import { z } from 'zod';

const optionalUrl = z.union([z.url(), z.literal('')]).optional();
export const businessInput = z.object({
  name: z.string().trim().min(2).max(160),
  industry: z.string().min(1),
  niche: z.string().min(1),
  country: z.string().default('United States'),
  state: z.string().default('California'),
  city: z.string().default('San Jose'),
  area: z.string().trim().max(100).optional(),
  address: z.string().trim().max(300).optional(),
  website: optionalUrl,
  googleBusinessUrl: optionalUrl,
  phone: z.string().trim().max(40).optional(),
  publicEmail: z.union([z.email(), z.literal('')]).optional(),
  googleRating: z.number().min(0).max(5).optional(),
  googleReviews: z.number().int().min(0).optional(),
  yelpUrl: optionalUrl,
  yelpReviews: z.number().int().min(0).optional(),
  socialLinks: z
    .object({
      facebook: optionalUrl,
      instagram: optionalUrl,
      linkedin: optionalUrl,
      youtube: optionalUrl,
    })
    .optional(),
  estimatedBusinessSize: z.enum(['Solo', 'Small', 'Medium', 'Large']).optional(),
  estimatedEmployees: z.number().int().positive().optional(),
  yearsInBusiness: z.number().int().min(0).optional(),
  services: z.array(z.string().max(100)).default([]),
  notes: z.string().max(5000).optional(),
  sources: z
    .array(
      z.object({
        url: z.url(),
        label: z.string().optional(),
        observedAt: z.coerce.date().optional(),
      }),
    )
    .min(1),
  scores: z
    .object({
      website: z.number().min(0).max(10).default(0),
      seo: z.number().min(0).max(10).default(0),
      googleBusiness: z.number().min(0).max(10).default(0),
      social: z.number().min(0).max(10).default(0),
      marketingNeed: z.number().min(0).max(15).default(0),
      revenuePotential: z.number().min(0).max(20).default(0),
      contactability: z.number().min(0).max(5).default(0),
      competition: z.number().min(0).max(10).default(0),
    })
    .optional(),
});

export const businessPatch = businessInput.partial();
export const businessQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().max(100).optional(),
  industry: z.string().optional(),
  niche: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  priority: z.enum(['Excellent', 'High', 'Medium', 'Low']).optional(),
  status: z.string().optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  maxScore: z.coerce.number().min(0).max(100).optional(),
  sort: z.enum(['score', 'newest', 'reviews', 'name']).default('score'),
});
