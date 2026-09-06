import assert from 'node:assert/strict';
import test from 'node:test';
import type { Request, Response } from 'express';
import { sanitizeRequest } from './sanitize.js';

test('sanitizer removes Mongo operators and dotted keys recursively', () => {
  const request = {
    body: { $where: 'dangerous', safe: { 'profile.role': 'admin', name: 'Allowed' } },
    params: {},
    query: {},
  } as unknown as Request;
  sanitizeRequest(request, {} as Response, () => undefined);
  assert.deepEqual(request.body, { safe: { name: 'Allowed' } });
});

test('sanitizer preserves ordinary arrays and nested fields', () => {
  const request = {
    body: { services: ['SEO', 'Local SEO'], scores: { website: 6 } },
    params: {},
    query: {},
  } as unknown as Request;
  sanitizeRequest(request, {} as Response, () => undefined);
  assert.deepEqual(request.body, { services: ['SEO', 'Local SEO'], scores: { website: 6 } });
});
