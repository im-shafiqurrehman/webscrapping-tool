'use client';

import { useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  Database,
  Globe2,
  KeyRound,
  MapPin,
  Plus,
  Save,
  Shield,
  SlidersHorizontal,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, Card, PageHeader, SectionTitle } from './ui';

const initialWeights = {
  'Revenue & budget': 20,
  'SEO opportunity': 20,
  'Website improvement': 15,
  'GBP opportunity': 15,
  'Marketing need': 15,
  'Ease of contact': 5,
  'Competition opportunity': 10,
};
export function SettingsPage() {
  const [tab, setTab] = useState('Scoring');
  const [weights, setWeights] = useState(initialWeights);
  const [saved, setSaved] = useState(false);
  const total = useMemo(() => Object.values(weights).reduce((a, b) => a + b, 0), [weights]);
  const tabs: Array<[string, LucideIcon]> = [
    ['Scoring', SlidersHorizontal],
    ['Team & roles', UsersRound],
    ['Markets', MapPin],
    ['Integrations', Database],
    ['Security', Shield],
  ];
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        description="Configure scoring, permissions, markets, and approved data providers."
        actions={
          <Button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 1600);
            }}
          >
            <Save size={15} /> {saved ? 'Saved' : 'Save changes'}
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[230px_1fr]">
        <Card className="h-fit p-2">
          {tabs.map(([label, Icon]) => (
            <button
              onClick={() => setTab(String(label))}
              key={String(label)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[11px] font-semibold ${tab === label ? 'bg-ink text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-ink'}`}
            >
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={13} className="opacity-40" />
            </button>
          ))}
        </Card>
        <div>
          {tab === 'Scoring' && (
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold">Client scoring model</h2>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Weights must total 100. Audit quality remains separate from opportunity: lower
                    website quality creates a higher improvement opportunity.
                  </p>
                </div>
                <span
                  className={`rounded-xl px-3 py-2 text-xs font-extrabold ${total === 100 ? 'bg-emerald-50 text-brand' : 'bg-red-50 text-coral'}`}
                >
                  {total}/100
                </span>
              </div>
              <div className="mt-6 divide-y">
                {Object.entries(weights).map(([label, value]) => (
                  <div
                    key={label}
                    className="grid items-center gap-4 py-4 sm:grid-cols-[1fr_1.5fr_70px]"
                  >
                    <div>
                      <p className="text-xs font-bold">{label}</p>
                      <p className="mt-0.5 text-[9px] text-slate-400">
                        Maximum contribution to client score
                      </p>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={value}
                      onChange={(e) =>
                        setWeights((w) => ({ ...w, [label]: Number(e.target.value) }))
                      }
                      className="accent-[#147D64]"
                    />
                    <div className="flex h-9 items-center rounded-xl border bg-slate-50 px-3 text-xs font-bold">
                      {value} pts
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4 text-[11px]">
                <span className="text-slate-500">Classification thresholds</span>
                <span className="font-semibold">
                  Excellent 85+ · High 70+ · Medium 55+ · Low &lt;55
                </span>
              </div>
            </Card>
          )}
          {tab === 'Team & roles' && (
            <Card className="p-6">
              <SectionTitle
                title="Team & access"
                subtitle="Role-based access is enforced again in the API"
              />
              <div className="mt-5 divide-y rounded-xl border">
                {[
                  ['Shafiq Rehman', 'shafiq@example.com', 'Admin', 'SR'],
                  ['Maya Chen', 'maya@example.com', 'Researcher', 'MC'],
                  ['Alex Morgan', 'alex@example.com', 'Sales User', 'AM'],
                ].map(([name, email, role, initials]) => (
                  <div key={email} className="flex items-center gap-3 p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-[10px] font-bold text-brand">
                      {initials}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-bold">{name}</p>
                      <p className="text-[9px] text-slate-400">{email}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">
                      {role}
                    </span>
                  </div>
                ))}
              </div>
              <Button className="mt-4">
                <Plus size={15} /> Invite teammate
              </Button>
            </Card>
          )}
          {tab === 'Markets' && (
            <Card className="p-6">
              <SectionTitle
                title="Markets & locations"
                subtitle="Add cities, states, countries, and service areas without changing the schema"
              />
              <div className="mt-5 rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-brand">
                    <MapPin size={18} />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-bold">San Jose, California</p>
                    <p className="mt-0.5 text-[9px] text-slate-400">
                      United States · Primary market
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-brand">
                    Active
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    'Downtown',
                    'North San Jose',
                    'South San Jose',
                    'East San Jose',
                    'West San Jose',
                  ].map((a) => (
                    <span
                      className="rounded-lg border px-2.5 py-1.5 text-[9px] font-semibold text-slate-600"
                      key={a}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <Button variant="secondary" className="mt-4">
                <Plus size={15} /> Add market
              </Button>
            </Card>
          )}
          {tab === 'Integrations' && (
            <Card className="p-6">
              <SectionTitle
                title="Approved data providers"
                subtitle="Connect official APIs only; credentials stay server-side"
              />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ['Google Places API', 'Public business profiles and locations'],
                  ['Yelp Fusion API', 'Public listing and review signals'],
                  ['PageSpeed Insights', 'Website performance audits'],
                  ['SERP provider', 'Permitted ranking data provider'],
                ].map(([name, desc]) => (
                  <div className="rounded-xl border p-4" key={name}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                      <Globe2 size={17} />
                    </span>
                    <p className="mt-3 text-xs font-bold">{name}</p>
                    <p className="mt-1 text-[9px] text-slate-400">{desc}</p>
                    <Button variant="secondary" className="mt-4 h-8 px-3 text-[10px]">
                      <KeyRound size={12} /> Configure
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {tab === 'Security' && (
            <Card className="p-6">
              <SectionTitle
                title="Security controls"
                subtitle="Production safeguards across the API and workspace"
              />
              <div className="mt-5 space-y-3">
                {[
                  'JWT authentication with expiring tokens',
                  'Admin, Researcher, and Sales authorization',
                  'Zod request validation',
                  'Helmet, CORS, rate limits, and NoSQL sanitization',
                  'Immutable activity trail for material changes',
                  'Secrets available only to the server',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border p-3 text-[11px] font-semibold"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-mint text-brand">
                      <Check size={13} />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
