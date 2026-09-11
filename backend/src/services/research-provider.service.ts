import { env } from '../config/env.js';
import { searchBusinessesWithGroq } from './groq-search.service.js';
import { searchBusinessesWithXai, type LiveResearchInput } from './xai-search.service.js';

export function activeResearchProvider() {
  return env.SEARCH_PROVIDER === 'xai'
    ? { id: 'xai', dailyBudget: env.XAI_DAILY_SEARCH_BUDGET }
    : { id: 'groq', dailyBudget: env.GROQ_DAILY_SEARCH_BUDGET };
}

export function searchBusinesses(input: LiveResearchInput) {
  return env.SEARCH_PROVIDER === 'xai'
    ? searchBusinessesWithXai(input)
    : searchBusinessesWithGroq(input);
}
