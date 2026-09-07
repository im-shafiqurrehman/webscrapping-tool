import assert from 'node:assert/strict';
import test from 'node:test';
import { env } from '../config/env.js';
import { searchBusinessesWithXai } from './xai-search.service.js';

const input = {
  market: { city: 'London', region: 'Greater London', country: 'United Kingdom' },
  industry: 'Home Services',
  niche: 'Plumbing',
  limit: 5,
};

test('live search requires a server-side xAI key', async () => {
  const originalKey = env.XAI_API_KEY;
  env.XAI_API_KEY = undefined;
  await assert.rejects(searchBusinessesWithXai(input), /XAI_API_KEY/);
  env.XAI_API_KEY = originalKey;
});

test('live search validates and returns cited structured candidates', async () => {
  const originalKey = env.XAI_API_KEY;
  const originalFetch = globalThis.fetch;
  env.XAI_API_KEY = 'test-key';
  globalThis.fetch = async (_url, init) => {
    const request = JSON.parse(String(init?.body)) as {
      tools: Array<{ type: string }>;
      input: Array<{ content: string }>;
    };
    assert.equal(request.tools[0]?.type, 'web_search');
    assert.match(request.input[1]?.content ?? '', /London/);
    return new Response(
      JSON.stringify({
        citations: ['https://example.org/directory'],
        output: [
          {
            type: 'message',
            content: [
              {
                type: 'output_text',
                text: JSON.stringify({
                  businesses: [
                    {
                      name: 'Verified Plumbing Ltd',
                      address: '1 Example Road, London',
                      website: 'https://example.org',
                      phone: '+44 20 0000 0000',
                      publicEmail: null,
                      googleRating: 4.5,
                      googleReviews: 20,
                      evidenceSummary: 'Identity and location appear on the cited public page.',
                      sourceUrls: ['https://example.org/directory'],
                    },
                  ],
                }),
              },
            ],
          },
        ],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };

  try {
    const result = await searchBusinessesWithXai(input);
    assert.equal(result.businesses.length, 1);
    assert.equal(result.businesses[0]?.name, 'Verified Plumbing Ltd');
    assert.deepEqual(result.citations, ['https://example.org/directory']);
  } finally {
    env.XAI_API_KEY = originalKey;
    globalThis.fetch = originalFetch;
  }
});
