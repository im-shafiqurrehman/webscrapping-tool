export type Stage =
  | 'New Lead'
  | 'Researching'
  | 'High Priority'
  | 'Ready to Contact'
  | 'Contacted'
  | 'Follow Up'
  | 'Replied'
  | 'Meeting Booked'
  | 'Qualified'
  | 'Proposal Sent'
  | 'Won'
  | 'Lost';

export interface BusinessRecord {
  id: string;
  name: string;
  initials: string;
  color: string;
  industry: string;
  niche: string;
  area: string;
  city: string;
  address: string;
  website: string;
  phone: string;
  email: string | undefined;
  googleRating: number;
  googleReviews: number;
  yelpReviews: number;
  websiteScore: number;
  seoOpportunity: number;
  gbpOpportunity: number;
  socialOpportunity: number;
  marketingNeed: number;
  clientScore: number;
  priority: 'Excellent' | 'High' | 'Medium' | 'Low';
  status: Stage;
  businessSize: string;
  employees: string;
  years: number;
  services: string[];
  recommendedService: string;
  secondaryService: string;
  mainOpportunity: string;
  nextAction: string;
  tags: string[];
  observed: string[];
  sourceCount: number;
  updatedAt: string;
}

export interface NicheRecord {
  id: string;
  rank: number;
  name: string;
  industry: string;
  businesses: number;
  averageScore: number;
  digitalScore: number;
  seo: number;
  budget: number;
  competition: number;
  score: number;
}

// No records are bundled with the client. Real records are loaded from the authenticated API.
export const businesses: BusinessRecord[] = [];
export const nicheRows: NicheRecord[] = [];
export const activities: Array<{ title: string; detail: string; time: string }> = [];

export const nicheSlug = (value: string) =>
  value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
