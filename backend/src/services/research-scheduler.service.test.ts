import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isValidCronAuthorization,
  nextDailyRun,
  researchOccurrenceKey,
} from './research-scheduler.service.js';

test('cron authorization accepts only the exact bearer secret', () => {
  assert.equal(isValidCronAuthorization('Bearer correct-secret', 'correct-secret'), true);
  assert.equal(isValidCronAuthorization('Bearer wrong-secretxx', 'correct-secret'), false);
  assert.equal(isValidCronAuthorization(undefined, 'correct-secret'), false);
});

test('nextDailyRun returns the configured UTC time today when still ahead', () => {
  assert.equal(
    nextDailyRun('15:30', new Date('2026-09-08T10:00:00.000Z')).toISOString(),
    '2026-09-08T15:30:00.000Z',
  );
});

test('nextDailyRun advances to tomorrow when the time has passed', () => {
  assert.equal(
    nextDailyRun('03:00', new Date('2026-09-08T10:00:00.000Z')).toISOString(),
    '2026-09-09T03:00:00.000Z',
  );
});

test('occurrence keys distinguish scheduled runs', () => {
  assert.equal(
    researchOccurrenceKey('schedule-1', new Date('2026-09-08T03:00:00.000Z')),
    'schedule-1:2026-09-08T03:00:00.000Z',
  );
});
