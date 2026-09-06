import { dashboardData } from './demo-data';

export const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '/backend';

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem('northstar_token') : null;
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
    throw new Error(payload?.error?.message ?? `Request failed with status ${response.status}`);
  }
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
}

export async function fetchDashboard() {
  if (demoMode) return dashboardData;
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
  };
}

export async function loginWithApi(email: string, password: string) {
  if (demoMode) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return { token: 'demo-session', user: { name: 'Shafiq Rehman', role: 'admin' } };
  }
  return apiRequest<{ token: string; user: { name: string; role: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
