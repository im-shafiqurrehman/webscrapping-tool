import { z } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

const candidateSchema = z.object({
  name: z.string().min(1),
  address: z.string().nullable(),
  website: z.url().nullable(),
  phone: z.string().nullable(),
  publicEmail: z.email().nullable(),
  googleRating: z.number().min(0).max(5).nullable(),
  googleReviews: z.number().int().min(0).nullable(),
  evidenceSummary: z.string().min(1),
  sourceUrls: z.array(z.url()).min(1),
});

const discoverySchema = z.object({ businesses: z.array(candidateSchema) });
export type LiveResearchCandidate = z.infer<typeof candidateSchema>;

interface XaiResponse {
  citations?: string[];
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string };
}

const outputJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    businesses: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          address: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          website: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          phone: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          publicEmail: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          googleRating: { anyOf: [{ type: 'number' }, { type: 'null' }] },
          googleReviews: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
          evidenceSummary: { type: 'string' },
          sourceUrls: { type: 'array', items: { type: 'string' } },
        },
        required: [
          'name',
          'address',
          'website',
          'phone',
          'publicEmail',
          'googleRating',
          'googleReviews',
          'evidenceSummary',
          'sourceUrls',
        ],
      },
    },
  },
  required: ['businesses'],
} as const;

export async function searchBusinessesWithXai(input: {
  market: { city: string; region: string; country: string; area?: string | undefined };
  industry: string;
  niche: string;
  limit: number;
}) {
  if (!env.XAI_API_KEY) {
    throw new AppError(503, 'Live search is not configured. Add XAI_API_KEY on the backend.');
  }

  const location = [input.market.area, input.market.city, input.market.region, input.market.country]
    .filter(Boolean)
    .join(', ');
  const response = await fetch('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.XAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.XAI_MODEL,
      store: false,
      tools: [{ type: 'web_search' }],
      input: [
        {
          role: 'system',
          content:
            'You discover public business prospects. Never invent a business or contact field. Use null for unknown values. Every returned business must have at least one public citation URL that directly supports its identity or contact details. Do not return private personal contact data.',
        },
        {
          role: 'user',
          content: `Find up to ${input.limit} currently operating ${input.niche} businesses in ${location} for the ${input.industry} market. Prefer official websites and public business profiles. Return only candidates supported by the web pages you inspected.`,
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'business_discovery',
          schema: outputJsonSchema,
          strict: true,
        },
      },
    }),
    signal: AbortSignal.timeout(55_000),
  });

  const payload = (await response.json()) as XaiResponse;
  if (!response.ok) {
    throw new AppError(502, payload.error?.message ?? 'The live search provider rejected the request');
  }
  const outputText = payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === 'output_text')?.text;
  if (!outputText) throw new AppError(502, 'The live search provider returned no structured results');

  let decoded: unknown;
  try {
    decoded = JSON.parse(outputText);
  } catch {
    throw new AppError(502, 'The live search provider returned malformed JSON');
  }
  const parsed = discoverySchema.safeParse(decoded);
  if (!parsed.success) throw new AppError(502, 'The live search provider returned invalid data');
  const citations = [...new Set(payload.citations ?? [])];
  return {
    provider: 'xAI Grok web search',
    model: env.XAI_MODEL,
    searchedAt: new Date().toISOString(),
    query: { ...input, location },
    businesses: parsed.data.businesses.slice(0, input.limit),
    citations,
  };
}
