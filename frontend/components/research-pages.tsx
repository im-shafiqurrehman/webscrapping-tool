'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileJson,
  FileSpreadsheet,
  Globe2,
  Layers3,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { businesses, nicheRows, nicheSlug } from '@/lib/demo-data';
import { Button, Card, PageHeader, ScoreRing, SectionTitle } from './ui';

export function NichesPage() {
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('All industries');
  const rows = nicheRows.filter(
    (n) =>
      n.name.toLowerCase().includes(query.toLowerCase()) &&
      (industry === 'All industries' || n.industry === industry),
  );
  const best = nicheRows[0]!;
  return (
    <>
      <PageHeader
        eyebrow="Market intelligence"
        title="Niche opportunities"
        description="Compare market value, digital weakness, and the quality of prospects already researched."
        actions={
          <Link
            href="/research"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#26332f]"
          >
            <Plus size={16} /> Add niche
          </Link>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
        <Card className="relative overflow-hidden bg-[#172A24] p-5 text-white">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#45C69A]/10 blur-2xl" />
          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#65D8B0]">
            Best current opportunity
          </p>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">{best.name}</h2>
              <p className="mt-1 text-xs text-white/55">{best.industry}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold">{best.score}</span>
              <span className="text-xs text-white/40">/100</span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              ['Businesses', best.businesses],
              ['Avg score', best.averageScore],
              ['SEO opp.', `${best.seo}/10`],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl bg-white/[.07] p-3">
                <p className="text-[9px] text-white/45">{label}</p>
                <p className="mt-1 text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>
        </Card>
        <InsightCard
          title="Primary service"
          value="Local SEO"
          subtitle="Highest weighted need across top prospects"
          icon={<Sparkles />}
        />
        <InsightCard
          title="Entry-level offer"
          value="Local visibility audit"
          subtitle="Low-friction, evidence-backed conversation starter"
          icon={<BarChart3 />}
        />
      </div>
      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-xl border pl-9 text-xs outline-none focus:ring-2 focus:ring-brand/15"
              placeholder="Search niches…"
            />
          </div>
          <label className="relative">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="h-10 appearance-none rounded-xl border bg-white pl-3 pr-9 text-xs font-semibold"
            >
              <option>All industries</option>
              {Array.from(new Set(nicheRows.map((n) => n.industry))).map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </label>
          <Link
            href="/settings"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-white px-4 text-sm font-semibold text-ink hover:bg-slate-50"
          >
            <SlidersHorizontal size={14} /> Scoring model
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead>
              <tr className="h-11 border-b bg-slate-50/60 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5">Rank</th>
                <th>Niche</th>
                <th>Businesses found</th>
                <th>Avg client score</th>
                <th>Digital score</th>
                <th>SEO opportunity</th>
                <th>Budget potential</th>
                <th>Competition</th>
                <th>Final score</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((niche, index) => (
                <tr key={niche.name} className="group h-[66px] hover:bg-[#F9FBF9]">
                  <td className="px-5">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-extrabold ${index < 3 ? 'bg-mint text-brand' : 'bg-slate-100 text-slate-500'}`}
                    >
                      #{index + 1}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/niches/${nicheSlug(niche.name)}`}
                      className="inline-block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                    >
                      <span className="block text-[11px] font-bold group-hover:text-brand">
                        {niche.name}
                      </span>
                      <span className="mt-0.5 block text-[9px] text-slate-400">
                        {niche.industry}
                      </span>
                    </Link>
                  </td>
                  <td className="text-xs font-bold">{niche.businesses}</td>
                  <td>
                    <span className="text-xs font-bold">{niche.averageScore}</span>
                    <span className="text-[9px] text-slate-400">/100</span>
                  </td>
                  <td>
                    <MiniBar value={niche.digitalScore} />
                  </td>
                  <td>
                    <MiniBar value={niche.seo} />
                  </td>
                  <td>
                    <MiniBar value={niche.budget} />
                  </td>
                  <td>
                    <MiniBar value={niche.competition} />
                  </td>
                  <td>
                    <ScoreRing score={niche.score} size={40} />
                  </td>
                  <td>
                    <Link
                      href={`/niches/${nicheSlug(niche.name)}`}
                      aria-label={`View ${niche.name} niche details`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-mint hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                    >
                      <ArrowRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <SectionTitle
            title="Competitor gap analysis"
            subtitle="Weakness percentages only appear after the minimum sample is met"
          />
          <div className="mt-5 rounded-xl border border-dashed bg-slate-50/50 p-6 text-center">
            <Layers3 className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-bold">More records needed for gap percentages</p>
            <p className="mx-auto mt-1 max-w-md text-[11px] leading-5 text-slate-500">
              The leading niche currently has {best.businesses} analyzed{' '}
              {best.businesses === 1 ? 'business' : 'businesses'}. Analyze at least 5 before
              percentages such as “weak websites” are displayed.
            </p>
            <Link
              href="/research"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand"
            >
              Research {best.name} <ArrowRight size={13} />
            </Link>
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Score methodology" />
          <div className="mt-4 space-y-3">
            {[
              ['Potential businesses', 15],
              ['Average customer value', 15],
              ['Lifetime value', 10],
              ['Retainer ability', 15],
              ['Local search demand', 15],
              ['SEO opportunity', 10],
              ['Digital weakness', 10],
              ['Competition level', 5],
              ['Lead availability', 5],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{label}</span>
                <strong>{value} pts</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
function InsightCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint text-brand [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      <p className="mt-5 text-[9px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      <p className="mt-1 text-base font-bold">{value}</p>
      <p className="mt-2 text-[10px] leading-4 text-slate-500">{subtitle}</p>
    </Card>
  );
}
function MiniBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 text-[11px] font-bold">{value}</span>
      <span className="h-1.5 w-12 rounded bg-slate-100">
        <span className="block h-full rounded bg-brand" style={{ width: `${value * 10}%` }} />
      </span>
    </div>
  );
}

export function AuditsPage() {
  const [active, setActive] = useState('All audits');
  const options = ['All audits', 'Website', 'SEO', 'Google Business', 'Social'];
  const auditStats: Array<[string, string | number, LucideIcon, string]> = [
    ['Waiting for audit', businesses.filter((b) => b.status === 'New Lead').length, Clock3, 'text-amber-600 bg-amber-50'],
    ['Audited this month', businesses.length, CheckCircle2, 'text-brand bg-emerald-50'],
    ['High SEO opportunity', businesses.filter((b) => b.seoOpportunity >= 8).length, Search, 'text-blue-600 bg-blue-50'],
    ['Evidence coverage', '87%', ShieldCheck, 'text-violet-600 bg-violet-50'],
  ];
  return (
    <>
      <PageHeader
        eyebrow="Digital intelligence"
        title="Audit center"
        description="Evaluate public digital signals consistently, keep evidence, and surface the clearest opportunities."
        actions={
          <Link
            href="/businesses"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#26332f]"
          >
            <Plus size={16} /> New audit
          </Link>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {auditStats.map(([label, value, Icon, tone]) => (
          <Card className="p-4" key={String(label)}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
              <Icon size={17} />
            </span>
            <p className="mt-4 text-2xl font-extrabold">{value}</p>
            <p className="text-[11px] font-semibold text-slate-500">{label}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => setActive(o)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-bold ${active === o ? 'bg-white text-ink shadow-sm' : 'text-slate-500'}`}
              >
                {o}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="h-9 rounded-xl border pl-9 text-xs" placeholder="Search audits…" />
          </div>
        </div>
        <div className="divide-y">
          {businesses.slice(0, 10).map((business, index) => (
            <Link
              href={`/businesses/${business.id}`}
              key={business.id}
              className="grid items-center gap-3 p-4 hover:bg-[#F9FBF9] sm:grid-cols-[1.4fr_.7fr_.7fr_.7fr_.8fr_auto]"
            >
              <div>
                <p className="text-xs font-bold">{business.name}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {business.niche} · {business.area}
                </p>
              </div>
              <AuditScore label="Website" score={business.websiteScore} quality />
              <AuditScore label="SEO opp." score={business.seoOpportunity} />
              <AuditScore label="GBP opp." score={business.gbpOpportunity} />
              <div>
                <p className="text-[9px] uppercase text-slate-400">Evidence</p>
                <p className="mt-1 text-[11px] font-semibold">{business.sourceCount} sources</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-[9px] font-bold ${index < 8 ? 'bg-emerald-50 text-brand' : 'bg-amber-50 text-amber-700'}`}
              >
                {index < 8 ? 'Complete' : 'Review due'}
              </span>
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}
function AuditScore({
  label,
  score,
  quality,
}: {
  label: string;
  score: number;
  quality?: boolean;
}) {
  const warning = quality ? score <= 5 : score >= 8;
  return (
    <div>
      <p className="text-[9px] uppercase text-slate-400">{label}</p>
      <p className={`mt-1 text-xs font-extrabold ${warning ? 'text-coral' : 'text-ink'}`}>
        {score}/10
      </p>
    </div>
  );
}

export function ResearchPage() {
  const [step, setStep] = useState(1);
  const [area, setArea] = useState('All San Jose');
  const [niche, setNiche] = useState('HVAC');
  const [source, setSource] = useState<'manual' | 'csv' | 'json'>('manual');
  const [running, setRunning] = useState(false);
  const sourceTypes: Array<['manual' | 'csv' | 'json', string, LucideIcon]> = [
    ['manual', 'Manual', Plus],
    ['csv', 'CSV', FileSpreadsheet],
    ['json', 'JSON', FileJson],
  ];
  const start = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setStep(3);
    }, 1000);
  };
  return (
    <>
      <PageHeader
        eyebrow="Data collection"
        title="Research workspace"
        description="Create compliant research runs, retain every source, and turn public business data into prioritized prospects."
      />
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex border-b bg-slate-50/60 px-5">
            {[
              ['1', 'Scope'],
              ['2', 'Import'],
              ['3', 'Review'],
            ].map(([n, label], i) => (
              <button
                key={n}
                onClick={() => setStep(i + 1)}
                className={`relative flex flex-1 items-center justify-center gap-2 py-4 text-[11px] font-bold ${step === i + 1 ? 'text-brand' : 'text-slate-400'}`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] ${step > i + 1 ? 'bg-brand text-white' : step === i + 1 ? 'bg-mint text-brand' : 'bg-slate-200 text-slate-500'}`}
                >
                  {step > i + 1 ? <Check size={11} /> : n}
                </span>
                {label}
                {step === i + 1 && (
                  <span className="absolute bottom-0 h-0.5 w-16 rounded bg-brand" />
                )}
              </button>
            ))}
          </div>
          {step === 1 && (
            <div className="p-6">
              <h2 className="text-base font-bold">Define your research market</h2>
              <p className="mt-1 text-[11px] text-slate-500">
                This creates the container used to track sources, progress, and errors.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <FieldLabel label="Research name">
                  <input defaultValue="San Jose HVAC Research" />
                </FieldLabel>
                <FieldLabel label="Location">
                  <input defaultValue="San Jose, California, USA" />
                </FieldLabel>
                <FieldLabel label="Area">
                  <select value={area} onChange={(e) => setArea(e.target.value)}>
                    <option>All San Jose</option>
                    <option>Downtown San Jose</option>
                    <option>North San Jose</option>
                    <option>South San Jose</option>
                    <option>East San Jose</option>
                    <option>West San Jose</option>
                  </select>
                </FieldLabel>
                <FieldLabel label="Industry">
                  <select>
                    <option>Home Services</option>
                    <option>Healthcare</option>
                    <option>Legal & Professional</option>
                  </select>
                </FieldLabel>
                <FieldLabel label="Niche">
                  <select value={niche} onChange={(e) => setNiche(e.target.value)}>
                    <option>HVAC</option>
                    <option>Plumbing</option>
                    <option>Dentists</option>
                    <option>Personal Injury Lawyers</option>
                  </select>
                </FieldLabel>
                <FieldLabel label="Research owner">
                  <select>
                    <option>Shafiq Rehman</option>
                  </select>
                </FieldLabel>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep(2)}>
                  Continue to data <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="p-6">
              <h2 className="text-base font-bold">Add public business data</h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Choose a manual entry or import a permitted dataset. Every record needs a source.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {sourceTypes.map(([key, label, Icon]) => (
                  <button
                    key={String(key)}
                    onClick={() => setSource(key)}
                    className={`rounded-xl border p-4 text-center ${source === key ? 'border-brand bg-emerald-50/50 ring-1 ring-brand' : 'hover:bg-slate-50'}`}
                  >
                    <Icon size={18} className="mx-auto text-brand" />
                    <p className="mt-2 text-[11px] font-bold">{label}</p>
                  </button>
                ))}
              </div>
              {source === 'manual' ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <FieldLabel label="Business name">
                    <input placeholder="Business name" />
                  </FieldLabel>
                  <FieldLabel label="Public source URL">
                    <input placeholder="https://…" />
                  </FieldLabel>
                  <FieldLabel label="Website">
                    <input placeholder="https://…" />
                  </FieldLabel>
                  <FieldLabel label="Public business phone">
                    <input placeholder="(408) …" />
                  </FieldLabel>
                </div>
              ) : (
                <label className="mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-slate-50 text-center">
                  <Upload size={23} className="text-brand" />
                  <p className="mt-3 text-xs font-bold">
                    Drop your {source.toUpperCase()} file here
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Up to 1,000 records per import · schema validation included
                  </p>
                  <input
                    type="file"
                    accept={source === 'csv' ? '.csv' : '.json'}
                    className="hidden"
                  />
                </label>
              )}
              <div className="mt-6 flex justify-between">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={start} disabled={running}>
                  {running ? 'Validating data…' : 'Create research run'} <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="p-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-brand">
                <CheckCircle2 size={26} />
              </span>
              <h2 className="mt-5 text-lg font-bold">Research run created</h2>
              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                San Jose {niche} is ready. Add verified public records manually or connect an
                approved API provider later.
              </p>
              <div className="mx-auto mt-5 max-w-sm rounded-xl border p-4 text-left">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Status</span>
                  <strong className="text-amber-600">Pending</strong>
                </div>
                <div className="mt-3 flex justify-between text-[11px]">
                  <span className="text-slate-500">Area</span>
                  <strong>{area}</strong>
                </div>
                <div className="mt-3 flex justify-between text-[11px]">
                  <span className="text-slate-500">Records</span>
                  <strong>0</strong>
                </div>
              </div>
              <Button className="mt-5" onClick={() => setStep(2)}>
                Add first business
              </Button>
            </div>
          )}
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <SectionTitle title="Responsible research" />
            <div className="mt-4 space-y-3">
              {[
                'Only public business information',
                'Source URL retained per record',
                'No unauthorized scraping',
                'Missing values remain Unknown',
                'API and rate-limit ready',
              ].map((item) => (
                <p key={item} className="flex items-center gap-2 text-[11px] text-slate-600">
                  <ShieldCheck size={14} className="text-brand" />
                  {item}
                </p>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Recent runs" />
            <div className="mt-4 space-y-3">
              {[
                ['San Jose HVAC', 'Completed', '4 / 4'],
                ['Dentists — Downtown', 'Running', '3 / 8'],
                ['Home Services Q3', 'Pending', '0 / 20'],
              ].map(([name, status, count]) => (
                <div key={name} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold">{name}</p>
                    <span
                      className={`text-[9px] font-bold ${status === 'Completed' ? 'text-brand' : status === 'Running' ? 'text-blue-600' : 'text-amber-600'}`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="mt-2 text-[9px] text-slate-400">{count} analyzed</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Approved integrations
            </p>
            <div className="mt-3 rounded-xl border border-dashed p-4 text-center">
              <Globe2 className="mx-auto text-slate-300" />
              <p className="mt-2 text-[11px] font-bold">No provider connected</p>
              <p className="mt-1 text-[10px] text-slate-400">
                Google Places, Yelp Fusion, and PageSpeed can be added from Settings.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement<{ className?: string }>;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-[10px] font-bold text-slate-500">{label}</span>
      <div className="[&>input]:h-10 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:px-3 [&>input]:text-xs [&>select]:h-10 [&>select]:w-full [&>select]:rounded-xl [&>select]:border [&>select]:bg-white [&>select]:px-3 [&>select]:text-xs">
        {children}
      </div>
    </label>
  );
}
