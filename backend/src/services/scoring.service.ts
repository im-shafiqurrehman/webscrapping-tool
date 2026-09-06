export interface ScoringInput {
  revenuePotential: number;
  seoOpportunity: number;
  websiteOpportunity: number;
  gbpOpportunity: number;
  marketingNeed: number;
  contactability: number;
  competitionOpportunity: number;
}

export const defaultWeights = {
  revenuePotential: 20,
  seoOpportunity: 20,
  websiteOpportunity: 15,
  gbpOpportunity: 15,
  marketingNeed: 15,
  contactability: 5,
  competitionOpportunity: 10,
} as const;

const clamp = (value: number, max: number) => Math.min(max, Math.max(0, value));

export function calculateClientScore(
  input: ScoringInput,
  weights: Record<keyof ScoringInput, number> = defaultWeights,
) {
  const breakdown = Object.fromEntries(
    (Object.keys(weights) as (keyof ScoringInput)[]).map((key) => [
      key,
      clamp(input[key], weights[key]),
    ]),
  ) as unknown as ScoringInput;
  const score = Math.round(Object.values(breakdown).reduce((sum, value) => sum + value, 0));
  return { score, priority: classifyScore(score), breakdown };
}

export function classifyScore(score: number): 'Excellent' | 'High' | 'Medium' | 'Low' {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'High';
  if (score >= 55) return 'Medium';
  return 'Low';
}

export function recommendServices(scores: {
  website: number;
  seo: number;
  googleBusiness: number;
  social: number;
}) {
  const choices = [
    { name: 'Local SEO', opportunity: scores.seo * 0.6 + scores.googleBusiness * 0.4 },
    { name: 'Google Business Profile Optimization', opportunity: scores.googleBusiness },
    { name: 'Website Conversion Optimization', opportunity: 10 - scores.website },
    { name: 'Technical SEO', opportunity: scores.seo * 0.8 + (10 - scores.website) * 0.2 },
    { name: 'Social Media Marketing', opportunity: scores.social },
  ];
  return choices
    .sort((a, b) => b.opportunity - a.opportunity)
    .slice(0, 3)
    .map(({ name }) => name);
}

export function mainOpportunity(scores: {
  website: number;
  seo: number;
  googleBusiness: number;
  social: number;
}) {
  const entries: [string, number][] = [
    ['Weak local search visibility', scores.seo],
    ['Under-optimized Google Business Profile', scores.googleBusiness],
    ['Website conversion gaps', 10 - scores.website],
    ['Inactive social presence', scores.social],
  ];
  return entries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Not yet researched';
}
