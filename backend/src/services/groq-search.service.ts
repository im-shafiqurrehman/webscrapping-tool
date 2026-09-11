import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { discoverySchema, type LiveResearchInput } from './xai-search.service.js';

interface GroqResponse {
  choices?: Array<{
    message?: { content?: string; executed_tools?: unknown[] };
  }>;
  error?: { message?: string };
}

function collectHttpUrls(value: unknown, urls = new Set<string>()): Set<string> {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/https?:\/\/[^\s"'<>\\)\]]+/g)) {
      try {
        urls.add(new URL(match[0].replace(/[.,;:]$/, '')).toString());
      } catch {
        // Provider tool output can include truncated URLs; those are not evidence.
      }
    }
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectHttpUrls(item, urls));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectHttpUrls(item, urls));
  }
  return urls;
}

function comparableUrl(value: string) {
  const url = new URL(value);
  return `${url.hostname.replace(/^www\./, '').toLowerCase()}${url.pathname.replace(/\/$/, '')}`;
}

function hasToolEvidence(source: string, evidenceUrls: Set<string>) {
  const normalized = comparableUrl(source);
  return [...evidenceUrls].some((evidence) => {
    const candidate = comparableUrl(evidence);
    return (
      candidate === normalized ||
      candidate.startsWith(`${normalized}/`) ||
      normalized.startsWith(`${candidate}/`)
    );
  });
}

function parseJsonContent(content: string) {
  const withoutFence = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  try {
    return JSON.parse(withoutFence) as unknown;
  } catch {
    throw new AppError(502, 'Groq returned malformed structured data');
  }
}

export async function searchBusinessesWithGroq(input: LiveResearchInput) {
  if (!env.GROQ_API_KEY) {
    throw new AppError(503, 'Live search is not configured. Add GROQ_API_KEY on the backend.');
  }

  const location = [input.market.area, input.market.city, input.market.region, input.market.country]
    .filter(Boolean)
    .join(', ');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
      'Groq-Model-Version': 'latest',
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You discover currently operating public businesses using web_search and visit_website. Never invent a business, phone, email, rating, review count, or URL. Use null when a field is not explicitly supported by an inspected page. Return one JSON object only with a businesses array. Each business must contain exactly: name, address, website, phone, publicEmail, googleRating, googleReviews, evidenceSummary, sourceUrls. sourceUrls must contain inspected public URLs supporting the record. Do not return private personal information.',
        },
        {
          role: 'user',
          content: `Find up to ${input.limit} currently operating ${input.niche} businesses in ${location} for the ${input.industry} market. Search the live web and visit official websites when available. Verify every reported contact field from the inspected sources. Return valid JSON only.`,
        },
      ],
      max_completion_tokens: Math.min(4_000, 1_000 + input.limit * 180),
      response_format: { type: 'json_object' },
      compound_custom: {
        tools: { enabled_tools: ['web_search', 'visit_website'] },
      },
    }),
    signal: AbortSignal.timeout(55_000),
  });

  const payload = (await response.json()) as GroqResponse;
  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const retrySeconds = Number(retryAfter);
      const wait = Number.isFinite(retrySeconds)
        ? ` in about ${Math.max(1, Math.ceil(retrySeconds))} seconds`
        : ' in about one minute';
      throw new AppError(
        429,
        `Groq free-tier rate limit reached. Try again${wait}.`,
      );
    }
    throw new AppError(
      502,
      payload.error?.message ?? 'Groq rejected the live-search request',
    );
  }
  const message = payload.choices?.[0]?.message;
  if (!message?.content) throw new AppError(502, 'Groq returned no structured results');
  const parsed = discoverySchema.safeParse(parseJsonContent(message.content));
  if (!parsed.success) throw new AppError(502, 'Groq returned data that failed validation');

  const evidenceUrls = collectHttpUrls(message.executed_tools);
  if (!evidenceUrls.size) throw new AppError(502, 'Groq returned no inspectable web-search evidence');
  const businesses = parsed.data.businesses
    .map((business) => ({
      ...business,
      sourceUrls: business.sourceUrls.filter((source) => hasToolEvidence(source, evidenceUrls)),
    }))
    .filter((business) => business.sourceUrls.length > 0)
    .slice(0, input.limit);
  if (!businesses.length) {
    throw new AppError(
      502,
      'Groq results were rejected because their sources were not present in tool evidence',
    );
  }

  return {
    provider: 'Groq Compound web search',
    model: env.GROQ_MODEL,
    searchedAt: new Date().toISOString(),
    query: { ...input, location },
    businesses,
    citations: [...evidenceUrls],
  };
}
