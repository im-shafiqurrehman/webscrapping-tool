'use client';

import { useState } from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Copy,
  ExternalLink,
  FileText,
  Globe2,
  Mail,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  Phone,
  Save,
  Sparkles,
  Star,
} from 'lucide-react';
import type { DemoBusiness } from '@/lib/demo-data';
import {
  Avatar,
  Button,
  Card,
  PageHeader,
  PriorityBadge,
  Progress,
  ScoreRing,
  StatusDot,
} from './ui';

const tabs = [
  'Overview',
  'Website Audit',
  'SEO Audit',
  'Google Business',
  'Social Media',
  'Scoring',
  'Research',
  'Outreach',
  'Notes',
];
export function BusinessDetail({ business }: { business: DemoBusiness }) {
  const [tab, setTab] = useState('Overview');
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PageHeader
        back="/businesses"
        title={business.name}
        description={`${business.industry} / ${business.niche} · ${business.area}, San Jose`}
        actions={
          <>
            <Button variant="secondary">
              <MoreHorizontal size={16} />
            </Button>
            <Button>
              <Mail size={15} /> Start outreach
            </Button>
          </>
        }
      />
      <Card className="mb-4 p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar initials={business.initials} color={business.color} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold">{business.name}</h2>
                <StatusDot status={business.status} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {business.area}
                </span>
                <a href={business.website} className="flex items-center gap-1 hover:text-brand">
                  <Globe2 size={12} />
                  Website <ExternalLink size={10} />
                </a>
                <span className="flex items-center gap-1">
                  <Phone size={12} />
                  {business.phone}
                </span>
              </div>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-[1.35fr_1fr_1fr_1fr] xl:ml-auto xl:max-w-3xl">
            <Summary label="Client score">
              <span className="flex items-center gap-2">
                <ScoreRing score={business.clientScore} size={39} />
                <PriorityBadge priority={business.priority} />
              </span>
            </Summary>
            <Summary label="Google rating">
              <span className="text-sm font-extrabold">
                <Star size={13} className="mr-1 inline fill-amber-400 text-amber-400" />
                {business.googleRating}
              </span>
              <span className="ml-1 text-[10px] text-slate-400">
                {business.googleReviews} reviews
              </span>
            </Summary>
            <Summary label="Business size">
              <strong className="text-xs">{business.businessSize}</strong>
              <span className="block text-[10px] text-slate-400">{business.employees} people</span>
            </Summary>
            <Summary label="Last updated">
              <strong className="text-xs">{business.updatedAt}</strong>
              <span className="block text-[10px] text-slate-400">
                {business.sourceCount} sources
              </span>
            </Summary>
          </div>
        </div>
      </Card>
      <div className="mb-4 overflow-x-auto scrollbar-none">
        <div className="flex min-w-max gap-1 rounded-xl border bg-white p-1">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`rounded-lg px-3.5 py-2 text-[11px] font-semibold transition ${tab === item ? 'bg-ink text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-ink'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {tab === 'Overview' && <Overview business={business} onTab={setTab} />}
      {['Website Audit', 'SEO Audit', 'Google Business', 'Social Media'].includes(tab) && (
        <AuditPanel
          type={tab}
          business={business}
          onSave={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2200);
          }}
          saved={saved}
        />
      )}
      {tab === 'Scoring' && <Scoring business={business} />}
      {tab === 'Research' && <Research business={business} />}
      {tab === 'Outreach' && <Outreach business={business} />}
      {tab === 'Notes' && <Notes />}
    </>
  );
}
function Summary({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      {children}
    </div>
  );
}

function Overview({ business, onTab }: { business: DemoBusiness; onTab: (s: string) => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-brand">
                Recommended offer
              </p>
              <h3 className="mt-2 text-xl font-bold">{business.recommendedService}</h3>
              <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
                Lead with a focused audit that addresses the strongest recorded opportunity, then
                position {business.secondaryService.toLowerCase()} as the natural second step.
              </p>
            </div>
            <span className="rounded-xl bg-mint p-3 text-brand">
              <Sparkles size={20} />
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Mini label="Primary pain point" value={business.mainOpportunity} />
            <Mini label="Entry offer" value="Free local visibility audit" />
            <Mini label="Next action" value={business.nextAction} />
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold">Observed opportunities</h3>
          <p className="mt-1 text-[11px] text-slate-500">
            Claims below are grounded in stored audit observations.
          </p>
          <div className="mt-4 divide-y">
            {business.observed.map((item, i) => (
              <div key={item} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${i === 0 ? 'bg-red-50 text-coral' : 'bg-amber-50 text-amber-600'}`}
                >
                  {i === 0 ? <CircleAlert size={12} /> : <Check size={12} />}
                </span>
                <div>
                  <p className="text-xs font-semibold">{item}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Observed during manual audit · Evidence available
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold">Business information</h3>
          <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {[
              ['Address', business.address],
              ['Public phone', business.phone],
              ['Public email', business.email ?? 'Not Found'],
              ['Years in business', `${business.years} years (estimated)`],
              ['Main services', business.services.join(', ')],
              ['Tags', business.tags.join(', ')],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  {label}
                </p>
                <p className="mt-1 text-xs font-medium">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="space-y-4">
        <Card className="p-5">
          <h3 className="text-sm font-bold">Digital opportunity</h3>
          <div className="mt-5 space-y-5">
            <Meter
              label="Website quality"
              value={business.websiteScore}
              quality
              onClick={() => onTab('Website Audit')}
            />
            <Meter
              label="SEO opportunity"
              value={business.seoOpportunity}
              onClick={() => onTab('SEO Audit')}
            />
            <Meter
              label="Google Business opportunity"
              value={business.gbpOpportunity}
              onClick={() => onTab('Google Business')}
            />
            <Meter
              label="Social opportunity"
              value={business.socialOpportunity}
              onClick={() => onTab('Social Media')}
            />
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold">Contact readiness</h3>
          <div className="mt-4 space-y-3">
            {[
              ['Public business phone', true],
              ['Public business email', !!business.email],
              ['Website contact form', true],
              ['Assigned sales owner', false],
            ].map(([label, ok]) => (
              <div key={String(label)} className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{label}</span>
                {ok ? (
                  <CheckCircle2 size={15} className="text-brand" />
                ) : (
                  <span className="text-[10px] text-slate-400">Not set</span>
                )}
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex justify-between">
            <h3 className="text-sm font-bold">Research sources</h3>
            <button className="text-[10px] font-bold text-brand">View all</button>
          </div>
          <div className="mt-4 space-y-2">
            {[
              'Official website',
              'Public business profile',
              business.sourceCount > 2 ? 'Public directory' : null,
            ]
              .filter(Boolean)
              .map((source) => (
                <div
                  key={source}
                  className="flex items-center gap-2 rounded-xl border p-3 text-[11px] font-semibold"
                >
                  <FileText size={14} className="text-slate-400" />
                  <span className="flex-1">{source}</span>
                  <ExternalLink size={12} className="text-slate-400" />
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-[#FBFCFA] p-3">
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 text-[11px] font-semibold leading-4">{value}</p>
    </div>
  );
}
function Meter({
  label,
  value,
  quality,
  onClick,
}: {
  label: string;
  value: number;
  quality?: boolean;
  onClick: () => void;
}) {
  const warning = quality ? value <= 5 : value >= 8;
  return (
    <button onClick={onClick} className="block w-full text-left">
      <div className="mb-2 flex justify-between">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <span className={`text-xs font-extrabold ${warning ? 'text-coral' : 'text-brand'}`}>
          {value}/10 <ChevronRight size={13} className="inline" />
        </span>
      </div>
      <Progress value={value * 10} tone={warning ? 'amber' : 'brand'} />
    </button>
  );
}

const auditChecks: Record<string, string[]> = {
  'Website Audit': [
    'Website exists',
    'Mobile friendly',
    'Modern design',
    'Website speed',
    'HTTPS enabled',
    'Clear call-to-action',
    'Lead form',
    'Booking system',
    'Service pages',
    'Contact page',
    'Location pages',
    'Local SEO optimization',
    'Conversion quality',
  ],
  'SEO Audit': [
    'Local keyword targeting',
    'Title tags',
    'Service pages',
    'Location keywords',
    'Content or blog',
    'Internal linking',
    'Technical SEO',
    'Schema markup',
    'Indexing health',
    'Competitor visibility',
  ],
  'Google Business': [
    'Recent review activity',
    'Business description',
    'Photos',
    'Posts',
    'Primary category',
    'Service information',
    'Profile completeness',
    'Local visibility',
  ],
  'Social Media': [
    'Posting frequency',
    'Recent activity',
    'Engagement',
    'Brand consistency',
    'Content quality',
    'Cross-channel consistency',
    'Audience growth',
  ],
};
function AuditPanel({
  type,
  business,
  onSave,
  saved,
}: {
  type: string;
  business: DemoBusiness;
  onSave: () => void;
  saved: boolean;
}) {
  const initial = auditChecks[type]!.map((_, i) =>
    i % 3 === 0 ? 'weak' : i % 3 === 1 ? 'good' : 'unknown',
  );
  const [checks, setChecks] = useState(initial);
  const score =
    type === 'Website Audit'
      ? business.websiteScore
      : type === 'SEO Audit'
        ? business.seoOpportunity
        : type === 'Google Business'
          ? business.gbpOpportunity
          : business.socialOpportunity;
  const scoreLabel = type === 'Website Audit' ? 'Quality score' : 'Opportunity score';
  return (
    <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h3 className="font-bold">{type}</h3>
            <p className="mt-1 text-[11px] text-slate-500">
              Mark only what you can verify from public evidence.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase text-slate-400">{scoreLabel}</p>
              <p className="text-lg font-extrabold">
                {score}
                <span className="text-xs text-slate-400">/10</span>
              </p>
            </div>
            <ScoreRing score={score * 10} size={44} />
          </div>
        </div>
        <div className="divide-y">
          {auditChecks[type]!.map((label, i) => (
            <div key={label} className="flex items-center justify-between gap-4 px-5 py-3">
              <span className="text-xs font-semibold">{label}</span>
              <div className="flex rounded-lg bg-slate-100 p-0.5">
                {(['good', 'weak', 'unknown'] as const).map((state) => (
                  <button
                    key={state}
                    onClick={() =>
                      setChecks((current) => current.map((v, idx) => (idx === i ? state : v)))
                    }
                    className={`rounded-md px-2.5 py-1 text-[9px] font-bold capitalize ${checks[i] === state ? (state === 'good' ? 'bg-white text-brand shadow-sm' : state === 'weak' ? 'bg-white text-coral shadow-sm' : 'bg-white text-slate-500 shadow-sm') : 'text-slate-400'}`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="space-y-4">
        <Card className="p-5">
          <h3 className="text-sm font-bold">Audit notes</h3>
          <textarea
            className="mt-3 min-h-32 w-full resize-none rounded-xl border p-3 text-xs outline-none focus:ring-2 focus:ring-brand/15"
            defaultValue={business.mainOpportunity}
          />
          <label className="mt-3 block">
            <span className="text-[10px] font-bold text-slate-500">Evidence URL</span>
            <input
              className="mt-1.5 h-10 w-full rounded-xl border px-3 text-xs outline-none"
              placeholder="https://public-source.example"
            />
          </label>
          <Button onClick={onSave} className="mt-4 w-full">
            {saved ? (
              <>
                <CheckCircle2 size={15} /> Saved
              </>
            ) : (
              <>
                <Save size={15} /> Save audit
              </>
            )}
          </Button>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold">Scoring guidance</h3>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">
            Website uses a quality score: 10 is strongest. SEO, GBP, and social use opportunity
            scores: 10 means the largest credible growth opportunity.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Scoring({ business }: { business: DemoBusiness }) {
  const values = [
    ['Revenue & budget potential', 18, 20],
    ['SEO opportunity', business.seoOpportunity * 2, 20],
    ['Website improvement', Math.round((10 - business.websiteScore) * 1.5), 15],
    ['GBP opportunity', Math.round(business.gbpOpportunity * 1.5), 15],
    ['Marketing need', business.marketingNeed, 15],
    ['Ease of contact', business.email ? 5 : 3, 5],
    ['Competition opportunity', 8, 10],
  ];
  return (
    <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
      <Card className="p-5">
        <h3 className="text-sm font-bold">Client score breakdown</h3>
        <p className="mt-1 text-[11px] text-slate-500">
          Transparent weighted calculation. Adjust global weights in Settings.
        </p>
        <div className="mt-5 space-y-4">
          {values.map(([label, value, max]) => (
            <div key={String(label)}>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="font-semibold text-slate-600">{label}</span>
                <strong>
                  {value}/{max}
                </strong>
              </div>
              <Progress value={(Number(value) / Number(max)) * 100} />
            </div>
          ))}
        </div>
      </Card>
      <Card className="flex flex-col items-center justify-center p-8 text-center">
        <ScoreRing score={business.clientScore} size={100} />
        <h3 className="mt-5 text-xl font-bold">{business.priority} opportunity</h3>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {business.clientScore >= 85
            ? 'Contact immediately with a personalized, evidence-backed audit.'
            : 'Review the strongest recorded opportunity before outreach.'}
        </p>
        <PriorityBadge priority={business.priority} />
      </Card>
    </div>
  );
}
function Research({ business }: { business: DemoBusiness }) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-bold">Research record</h3>
      <p className="mt-1 text-[11px] text-slate-500">
        Observed, estimated, calculated, and generated fields remain distinct.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        {[
          ['Observed', 'Rating, reviews, website, phone'],
          ['Estimated', `Size: ${business.businessSize}; employees: ${business.employees}`],
          ['Calculated', `Client score: ${business.clientScore}/100`],
          ['Generated', `Recommended: ${business.recommendedService}`],
        ].map(([type, value]) => (
          <div className="rounded-xl border p-4" key={type}>
            <p className="text-[9px] font-bold uppercase tracking-wider text-brand">{type}</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-dashed p-4 text-xs text-slate-500">
        <Calendar size={15} className="mr-2 inline" /> Researched September 6, 2026 ·{' '}
        {business.sourceCount} public sources retained
      </div>
    </Card>
  );
}
function Outreach({ business }: { business: DemoBusiness }) {
  const [copied, setCopied] = useState(false);
  const body = `Hi ${business.name} team — while reviewing ${business.niche.toLowerCase()} businesses in San Jose, I noticed ${business.mainOpportunity.toLowerCase()}. I put together a short audit with three practical ideas that may help. Would it be useful if I sent it over?`;
  return (
    <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
      <Card className="p-5">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-bold">Personalized cold email</h3>
            <p className="mt-1 text-[11px] text-slate-500">Built only from stored observations.</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              void navigator.clipboard?.writeText(body);
              setCopied(true);
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <div className="mt-5 rounded-xl border bg-slate-50 p-5 text-xs leading-6 text-slate-650">
          <p>
            <strong>Subject:</strong> A quick idea for {business.name}
          </p>
          <p className="mt-3">{body}</p>
          <p className="mt-3">
            Best,
            <br />
            Shafiq
          </p>
        </div>
      </Card>
      <Card className="p-5">
        <h3 className="text-sm font-bold">Why this message is safe</h3>
        <div className="mt-4 space-y-3">
          {business.observed.map((item) => (
            <p key={item} className="flex gap-2 text-[11px] leading-5 text-slate-500">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-brand" />
              {item}
            </p>
          ))}
        </div>
        <Button className="mt-5 w-full">
          <MessageSquareText size={15} /> Save as draft
        </Button>
      </Card>
    </div>
  );
}
function Notes() {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-bold">Internal notes</h3>
      <textarea
        className="mt-4 min-h-52 w-full rounded-xl border p-4 text-xs outline-none focus:ring-2 focus:ring-brand/15"
        placeholder="Add context for research and sales teammates…"
      />
      <div className="mt-3 flex justify-end">
        <Button>
          <Save size={15} /> Save notes
        </Button>
      </div>
    </Card>
  );
}
