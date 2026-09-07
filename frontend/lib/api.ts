import { dashboardData } from './demo-data';

export const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '/backend';
export const authTokenKey = 'northstar_token';
export const authUserKey = 'northstar_user';
const demoUsersKey = 'northstar_demo_users';

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

interface DemoUser extends AuthUser {
  passwordDigest: string;
}

function storedToken() {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(authTokenKey) ?? window.localStorage.getItem(authTokenKey);
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
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === 'admin@northstar.local' && password === 'Northstar123!') {
      return {
        token: `demo-${crypto.randomUUID()}`,
        user: {
          id: 'demo-admin',
          name: 'Shafiq Rehman',
          email: normalizedEmail,
          role: 'admin',
        },
      } satisfies AuthSession;
    }
    const users = readDemoUsers();
    const user = users.find((candidate) => candidate.email === normalizedEmail);
    if (!user || user.passwordDigest !== (await digestPassword(password))) {
      throw new Error('Invalid credentials');
    }
    const { passwordDigest: _passwordDigest, ...safeUser } = user;
    void _passwordDigest;
    return { token: `demo-${crypto.randomUUID()}`, user: safeUser } satisfies AuthSession;
  }
  return apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signupWithApi(name: string, email: string, password: string) {
  if (demoMode) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const normalizedEmail = email.trim().toLowerCase();
    const users = readDemoUsers();
    if (
      normalizedEmail === 'admin@northstar.local' ||
      users.some((candidate) => candidate.email === normalizedEmail)
    ) {
      throw new Error('An account with this email already exists');
    }
    const user: DemoUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      role: 'researcher',
      passwordDigest: await digestPassword(password),
    };
    window.localStorage.setItem(demoUsersKey, JSON.stringify([...users, user]));
    const { passwordDigest: _passwordDigest, ...safeUser } = user;
    void _passwordDigest;
    return { token: `demo-${crypto.randomUUID()}`, user: safeUser } satisfies AuthSession;
  }
  return apiRequest<AuthSession>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function fetchCurrentUser() {
  return apiRequest<{ user: AuthUser }>('/auth/me');
}

function readDemoUsers(): DemoUser[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(demoUsersKey) ?? '[]') as DemoUser[];
  } catch {
    return [];
  }
}

async function digestPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
