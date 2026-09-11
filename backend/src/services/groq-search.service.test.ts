import assert from 'node:assert/strict';
import test from 'node:test';
import { env } from '../config/env.js';
import { searchBusinessesWithGroq } from './groq-search.service.js';

const input = {
  market: { city: 'San Jose', region: 'California', country: 'United States' },
  industry: 'Home Services',
  niche: 'Plumbing',
  limit: 5,
};

test('Groq search requires a server-side API key', async () => {
  const originalKey = env.GROQ_API_KEY;
  env.GROQ_API_KEY = undefined;
  await assert.rejects(searchBusinessesWithGroq(input), /GROQ_API_KEY/);
  env.GROQ_API_KEY = originalKey;
});

test('Groq search retains only candidates backed by executed-tool URLs', async () => {
  const originalKey = env.GROQ_API_KEY;
  const originalFetch = globalThis.fetch;
  env.GROQ_API_KEY = 'test-key';
  globalThis.fetch = async (_url, init) => {
    const request = JSON.parse(String(init?.body)) as {
      model: string;
      response_format: { type: string };
      max_completion_tokens: number;
      compound_custom: { tools: { enabled_tools: string[] } };
    };
    assert.equal(request.model, env.GROQ_MODEL);
    assert.equal(request.response_format.type, 'json_object');
    assert.equal(request.max_completion_tokens, 1_900);
    assert.deepEqual(request.compound_custom.tools.enabled_tools, ['web_search', 'visit_website']);
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                businesses: [
                  {
                    name: 'Verified Plumbing',
                    address: '1 Market Street, San Jose, CA',
                    website: 'https://verified.example',
                    phone: null,
                    publicEmail: null,
                    googleRating: null,
                    googleReviews: null,
                    evidenceSummary: 'The official site identifies the business and location.',
                    sourceUrls: ['https://verified.example/contact'],
                  },
                  {
                    name: 'Unsupported Plumbing',
                    address: null,
                    website: null,
                    phone: null,
                    publicEmail: null,
                    googleRating: null,
                    googleReviews: null,
                    evidenceSummary: 'No executed search result supports this entry.',
                    sourceUrls: ['https://unsupported.example'],
                  },
                ],
              }),
              executed_tools: [
                { type: 'search', search_results: [{ url: 'https://verified.example/' }] },
              ],
            },
          },
        ],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };

  try {
    const result = await searchBusinessesWithGroq(input);
    assert.equal(result.businesses.length, 1);
    assert.equal(result.businesses[0]?.name, 'Verified Plumbing');
    assert.equal(result.provider, 'Groq Compound web search');
  } finally {
    env.GROQ_API_KEY = originalKey;
    globalThis.fetch = originalFetch;
  }
});

test('Groq rate-limit errors are safe and actionable', async () => {
  const originalKey = env.GROQ_API_KEY;
  const originalFetch = globalThis.fetch;
  env.GROQ_API_KEY = 'test-key';
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({ error: { message: 'Private organization and usage details' } }),
      { status: 429, headers: { 'retry-after': '12.2', 'content-type': 'application/json' } },
    );
  try {
    await assert.rejects(
      searchBusinessesWithGroq(input),
      /Groq free-tier rate limit reached\. Try again in about 13 seconds/,
    );
  } finally {
    env.GROQ_API_KEY = originalKey;
    globalThis.fetch = originalFetch;
  }
});
