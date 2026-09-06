import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateClientScore, classifyScore, recommendServices } from './scoring.service.js';

test('client scoring respects the configured 100-point ceiling', () => {
  const result = calculateClientScore({
    revenuePotential: 50,
    seoOpportunity: 50,
    websiteOpportunity: 50,
    gbpOpportunity: 50,
    marketingNeed: 50,
    contactability: 50,
    competitionOpportunity: 50,
  });
  assert.equal(result.score, 100);
  assert.equal(result.priority, 'Excellent');
});

test('classification boundaries match the sales priority model', () => {
  assert.equal(classifyScore(85), 'Excellent');
  assert.equal(classifyScore(70), 'High');
  assert.equal(classifyScore(55), 'Medium');
  assert.equal(classifyScore(54), 'Low');
});

test('service recommendations respond to recorded weaknesses', () => {
  const services = recommendServices({ website: 3, seo: 9, googleBusiness: 8, social: 4 });
  assert.equal(services[0], 'Local SEO');
  assert.ok(services.includes('Google Business Profile Optimization'));
});
