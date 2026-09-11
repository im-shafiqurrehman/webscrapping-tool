const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
export const authTokenKey = 'northstar_token';
export const authUserKey = 'northstar_user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'researcher' | 'sales';
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

function storedToken() {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(authTokenKey) ?? window.localStorage.getItem(authTokenKey);
}

interface ApiBusiness {
  _id: string;
  name: string;
  industry?: { name?: string } | string;
  niche?: { name?: string } | string;
  city?: string;
  area?: string;
  address?: string;
  website?: string;
  phone?: string;
  publicEmail?: string;
  googleRating?: number;
  googleReviews?: number;
  yelpReviews?: number;
  estimatedBusinessSize?: string;
  estimatedEmployees?: number;
  yearsInBusiness?: number;
  services?: string[];
  scores?: Partial<{
    website: number;
    seo: number;
    googleBusiness: number;
    social: number;
    marketingNeed: number;
    clientScore: number;
  }>;
  priority?: BusinessRecord['priority'];
  status?: Stage;
  recommendedServices?: string[];
  mainOpportunity?: string;
  tags?: Array<{ name?: string } | string>;
  sources?: Array<{ url?: string; observedAt?: string }>;
  updatedAt?: string;
}

const relationName = (value: ApiBusiness['industry']) =>
  typeof value === 'string' ? value : value?.name ?? 'Unknown';

function toBusinessRecord(value: ApiBusiness): BusinessRecord {
  const initials = value.name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return {
    id: value._id,
    name: value.name,
    initials,
    color: 'emerald',
    industry: relationName(value.industry),
    niche: relationName(value.niche),
    city: value.city ?? '',
    area: value.area ?? '',
    address: value.address ?? '',
    website: value.website ?? '',
    phone: value.phone ?? '',
    email: value.publicEmail,
    googleRating: value.googleRating ?? 0,
    googleReviews: value.googleReviews ?? 0,
    yelpReviews: value.yelpReviews ?? 0,
    websiteScore: value.scores?.website ?? 0,
    seoOpportunity: value.scores?.seo ?? 0,
    gbpOpportunity: value.scores?.googleBusiness ?? 0,
    socialOpportunity: value.scores?.social ?? 0,
    marketingNeed: value.scores?.marketingNeed ?? 0,
    clientScore: value.scores?.clientScore ?? 0,
    priority: value.priority ?? 'Low',
    status: value.status ?? 'New Lead',
    businessSize: value.estimatedBusinessSize ?? 'Unknown',
    employees: value.estimatedEmployees ? String(value.estimatedEmployees) : 'Unknown',
    years: value.yearsInBusiness ?? 0,
    services: value.services ?? [],
    recommendedService: value.recommendedServices?.[0] ?? '',
    secondaryService: value.recommendedServices?.[1] ?? '',
    mainOpportunity: value.mainOpportunity ?? 'Audit required',
    nextAction: 'Review evidence',
    tags: (value.tags ?? []).map((tag) => (typeof tag === 'string' ? tag : tag.name ?? '')).filter(Boolean),
    observed: (value.sources ?? []).map((source) => source.url ?? '').filter(Boolean),
    sourceCount: value.sources?.length ?? 0,
    updatedAt: value.updatedAt ?? '',
  };
}

export async function fetchBusinesses() {
  const response = await apiRequest<{ data: ApiBusiness[] }>('/businesses?limit=100&sort=score');
  return response.data.map(toBusinessRecord);
}

export async function fetchBusiness(id: string) {
  return toBusinessRecord(await apiRequest<ApiBusiness>(`/businesses/${id}`));
}

export async function deleteBusiness(id: string) {
  return apiRequest<void>(`/businesses/${id}`, { method: 'DELETE' });
}

export async function updatePipelineStatus(id: string, status: Stage) {
  return apiRequest(`/pipeline/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = storedToken();
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    if (response.status === 401 && !path.startsWith('/auth/') && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('northstar:unauthorized'));
    }
    throw new Error(payload?.error?.message ?? `Request failed with status ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

interface ApiDashboard {
  metrics: {
    totalBusinesses: number;
    excellentProspects: number;
    highPriority: number;
    averageClientScore: number;
  };
  leadsByNiche: { name: string; leads: number; score: number }[];
  pipeline: { stage: string; count: number }[];
  scoreDistribution: { _id: number | string; count: number }[];
  addedOverTime: { _id: string; leads: number }[];
  topProspects: ApiBusiness[];
}

export async function fetchDashboard() {
  const response = await apiRequest<ApiDashboard>('/dashboard');
  const countStages = (stages: string[]) =>
    response.pipeline
      .filter((item) => stages.includes(item.stage))
      .reduce((sum, item) => sum + item.count, 0);
  const labels: Record<string, string> = {
    '0': 'Low',
    '55': 'Medium',
    '70': 'High',
    '85': 'Excellent',
  };
  return {
    metrics: {
      total: response.metrics.totalBusinesses,
      excellent: response.metrics.excellentProspects,
      high: response.metrics.highPriority,
      average: response.metrics.averageClientScore,
      contacted: countStages([
        'Contacted',
        'Follow Up',
        'Replied',
        'Meeting Booked',
        'Qualified',
        'Proposal Sent',
        'Won',
      ]),
      replies: countStages(['Replied', 'Meeting Booked', 'Qualified', 'Proposal Sent', 'Won']),
      qualified: countStages(['Qualified', 'Proposal Sent', 'Won']),
      won: countStages(['Won']),
    },
    byNiche: response.leadsByNiche,
    distribution: response.scoreDistribution.map((item) => ({
      range: labels[String(item._id)] ?? 'Unknown',
      count: item.count,
    })),
    overTime: response.addedOverTime.map((item) => ({ month: item._id, leads: item.leads })),
    businesses: response.topProspects.map(toBusinessRecord),
  };
}

export async function loginWithApi(email: string, password: string) {
  return apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signupWithApi(name: string, email: string, password: string) {
  return apiRequest<AuthSession>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function fetchCurrentUser() {
  return apiRequest<{ user: AuthUser }>('/auth/me');
}

export interface LiveResearchCandidate {
  name: string;
  address: string | null;
  website: string | null;
  phone: string | null;
  publicEmail: string | null;
  googleRating: number | null;
  googleReviews: number | null;
  evidenceSummary: string;
  sourceUrls: string[];
}

export interface LiveResearchResponse {
  provider: string;
  model: string;
  searchedAt: string;
  query: { location: string };
  businesses: LiveResearchCandidate[];
  citations: string[];
}

export async function runLiveResearch(input: {
  market: { city: string; region: string; country: string; area?: string };
  industry: string;
  niche: string;
  limit: number;
}) {
  return apiRequest<LiveResearchResponse>('/research/live-search', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export interface ResearchSchedule {
  _id: string;
  name: string;
  market: { city: string; region: string; country: string; area?: string };
  industry: string;
  niche: string;
  limit: number;
  timeUtc: string;
  enabled: boolean;
  nextRunAt: string;
  lastRunAt?: string;
}

export interface ResearchJob {
  _id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  scheduledFor: string;
  attempts: number;
  discoveredCount: number;
  newCandidateCount: number;
  error?: string;
  schedule?: { name: string };
}

export async function fetchResearchAutomation() {
  const [schedules, jobs] = await Promise.all([
    apiRequest<{ data: ResearchSchedule[] }>('/research/schedules'),
    apiRequest<{ data: ResearchJob[] }>('/research/jobs'),
  ]);
  return { schedules: schedules.data, jobs: jobs.data };
}

export async function createResearchSchedule(input: {
  name: string;
  market: { city: string; region: string; country: string; area?: string };
  industry: string;
  niche: string;
  limit: number;
  timeUtc: string;
  enabled: boolean;
}) {
  return apiRequest<ResearchSchedule>('/research/schedules', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function setResearchScheduleEnabled(id: string, enabled: boolean) {
  return apiRequest<ResearchSchedule>(`/research/schedules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  });
}

export async function deleteResearchSchedule(id: string) {
  return apiRequest<void>(`/research/schedules/${id}`, { method: 'DELETE' });
}

export async function retryResearchJob(id: string) {
  return apiRequest<ResearchJob>(`/research/jobs/${id}/retry`, { method: 'POST' });
}
import type { BusinessRecord, Stage } from './business-types';
