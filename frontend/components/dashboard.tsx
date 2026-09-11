'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  MessageSquareText,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { activities } from '@/lib/business-types';
import { fetchDashboard } from '@/lib/api';
import { Avatar, Card, PriorityBadge, Progress, ScoreRing, SectionTitle } from './ui';
import { useAuth } from './auth-provider';

const metricCards = [
  {
    label: 'Total businesses',
    key: 'total',
    icon: UsersRound,
    note: 'Owned by this account',
    tone: 'bg-emerald-50 text-brand',
  },
  {
    label: 'Excellent prospects',
    key: 'excellent',
    icon: Sparkles,
    note: 'Score 85 or higher',
    tone: 'bg-violet-50 text-violet-600',
  },
  {
    label: 'High priority',
    key: 'high',
    icon: Target,
    note: 'Ready for review',
    tone: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Avg. client score',
    key: 'average',
    icon: TrendingUp,
    note: 'Across all prospects',
    tone: 'bg-amber-50 text-amber-600',
  },
] as const;

export function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isError } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard });
  if (!data) {
    return (
      <div className="space-y-4">
        <div className="h-16 rounded-2xl skeleton" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-36 rounded-2xl skeleton" />
          ))}
        </div>
        {isError && <p className="text-sm text-coral">Unable to load dashboard data.</p>}
      </div>
    );
  }
  const businesses = data.businesses;
  const funnelBase = Math.max(data.metrics.contacted, 1);
  const funnelRows: Array<[string, number, number, LucideIcon, 'brand' | 'blue' | 'amber']> = [
    ['Contacted', data.metrics.contacted, (data.metrics.contacted / funnelBase) * 100, MessageSquareText, 'brand'],
    ['Replies received', data.metrics.replies, (data.metrics.replies / funnelBase) * 100, CheckCircle2, 'blue'],
    ['Qualified leads', data.metrics.qualified, (data.metrics.qualified / funnelBase) * 100, UserCheck, 'amber'],
    ['Clients won', data.metrics.won, (data.metrics.won / funnelBase) * 100, CircleDollarSign, 'brand'],
  ];
  const today = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(new Date());
  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-brand">
            {today}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-[28px]">
            Good morning, {user?.name.split(/\s+/)[0] ?? 'there'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here’s where your best opportunities are right now.
          </p>
        </div>
        <Link
          href="/research"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#26332f]"
        >
          <Sparkles size={16} /> Start research
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ label, key, icon: Icon, note, tone }) => (
          <Card key={key} className="p-4">
            <div className="flex items-start justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
                <Icon size={18} />
              </span>
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-2xl font-extrabold tracking-tight">{data.metrics[key]}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-700">{label}</p>
              </div>
              <p className="pb-0.5 text-[10px] text-slate-400">{note}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <SectionTitle
            title="Opportunity by niche"
            subtitle="Lead volume and average client score"
            href="/niches"
          />
          <div className="mt-5 h-[245px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byNiche} margin={{ top: 4, right: 4, left: -25, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#EEF0ED" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  tick={{ fill: '#7C8581' }}
                  interval={0}
                  tickFormatter={(v: string) => (v.length > 11 ? `${v.slice(0, 10)}…` : v)}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  tick={{ fill: '#98A09C' }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: '#F4F7F4' }}
                  contentStyle={{
                    border: '1px solid #E5E9E4',
                    borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(0,0,0,.06)',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="score" radius={[5, 5, 0, 0]} maxBarSize={32}>
                  {data.byNiche.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#147D64' : '#B9DACC'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle
            title="Outreach funnel"
            subtitle="From researched lead to client"
            href="/pipeline"
          />
          <div className="mt-5 space-y-4">
            {funnelRows.map(([label, value, width, Icon, tone]) => (
              <div key={String(label)}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-semibold text-slate-650">
                    <Icon size={14} className="text-slate-400" />
                    {label}
                  </span>
                  <strong>{value}</strong>
                </div>
                <Progress value={Number(width)} tone={tone} />
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-500">
            <strong className="text-ink">Strongest conversion:</strong> replies to qualified leads.
            Keep follow-ups focused on the stored audit evidence.
          </div>
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="p-5">
          <SectionTitle
            title="Top opportunities"
            subtitle="Prospects ranked by calculated client score"
            href="/prospects"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-y bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">Business</th>
                <th className="px-4">Niche</th>
                <th className="px-4">Score</th>
                <th className="px-4">Primary opportunity</th>
                <th className="px-4">Recommended service</th>
                <th className="px-4">Priority</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {businesses.slice(0, 7).map((business) => (
                <tr
                  key={business.id}
                  role="link"
                  tabIndex={0}
                  data-testid={`dashboard-prospect-${business.id}`}
                  aria-label={`View details for ${business.name}`}
                  onClick={() => router.push(`/businesses/${business.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push(`/businesses/${business.id}`);
                    }
                  }}
                  className="group cursor-pointer hover:bg-[#F9FBF9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/businesses/${business.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="flex items-center gap-3"
                    >
                      <Avatar initials={business.initials} color={business.color} />
                      <span>
                        <span className="block text-xs font-bold text-ink group-hover:text-brand">
                          {business.name}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-slate-400">
                          {business.area}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 text-xs font-medium text-slate-600">{business.niche}</td>
                  <td className="px-4">
                    <ScoreRing score={business.clientScore} size={38} />
                  </td>
                  <td className="max-w-[220px] px-4 text-xs text-slate-600">
                    {business.mainOpportunity}
                  </td>
                  <td className="px-4">
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700">
                      {business.recommendedService}
                    </span>
                  </td>
                  <td className="px-4">
                    <PriorityBadge priority={business.priority} />
                  </td>
                  <td className="pr-4" aria-hidden="true">
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-brand" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr]">
        <Card className="p-5">
          <SectionTitle title="Leads added" subtitle="Research momentum over six months" />
          <div className="mt-4 h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.overTime} margin={{ left: -30, right: 5 }}>
                <defs>
                  <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#147D64" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#147D64" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#EEF0ED" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, borderColor: '#E5E9E4', fontSize: 11 }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#147D64"
                  fill="url(#leadFill)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Score mix" subtitle="Opportunity quality" />
          <div className="mt-4 space-y-3">
            {data.distribution
              .slice()
              .reverse()
              .map((item, i) => (
                <div key={item.range}>
                  <div className="mb-1.5 flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-600">{item.range}</span>
                    <span className="font-bold">{item.count}</span>
                  </div>
                  <Progress
                    value={businesses.length ? (item.count / businesses.length) * 100 : 0}
                    tone={i === 0 ? 'brand' : i === 1 ? 'blue' : 'amber'}
                  />
                </div>
              ))}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Recent activity" href="/pipeline" />
          <div className="mt-4 space-y-4">
            {activities.map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                  <Clock3 size={12} className="text-slate-400" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold leading-4 text-ink">{item.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{item.detail}</p>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-slate-400">Activity appears after account actions are recorded.</p>
          </div>
        </Card>
      </div>
    </>
  );
}
