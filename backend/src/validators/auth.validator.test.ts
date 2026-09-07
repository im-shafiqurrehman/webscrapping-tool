import assert from 'node:assert/strict';
import test from 'node:test';
import { loginInput, signupInput } from './auth.validator.js';

test('signup input trims identity fields and normalizes email', () => {
  const value = signupInput.parse({
    name: '  Maya Chen  ',
    email: '  MAYA@EXAMPLE.COM ',
    password: 'Northstar123!',
  });

  assert.equal(value.name, 'Maya Chen');
  assert.equal(value.email, 'maya@example.com');
});

test('signup rejects weak passwords', () => {
  const result = signupInput.safeParse({
    name: 'Maya Chen',
    email: 'maya@example.com',
    password: 'password',
  });

  assert.equal(result.success, false);
});

test('login accepts an existing password without applying signup strength rules', () => {
  const value = loginInput.parse({ email: ' ADMIN@NORTHSTAR.LOCAL ', password: 'legacy' });

  assert.deepEqual(value, { email: 'admin@northstar.local', password: 'legacy' });
});
