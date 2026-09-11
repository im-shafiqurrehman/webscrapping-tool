'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  BarChart3,
  BriefcaseBusiness,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Copy,
  Download,
  FileBarChart,
  FileText,
  GripVertical,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  MoveRight,
  PhoneCall,
  Plus,
  Send,
  Sparkles,
  Target,
  Trophy,
  UserCheck,
  WandSparkles,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Stage } from '@/lib/business-types';
import { downloadCsv } from '@/lib/utils';
import { gmailComposeUrl } from '@/lib/gmail';
import { fetchBusinesses, updatePipelineStatus } from '@/lib/api';
import {
  Avatar,
  Button,
  Card,
  PageHeader,
  PriorityBadge,
  Progress,
  ScoreRing,
  SectionTitle,
  StatusDot,
} from './ui';
import { useNotifications } from './notification-provider';

export function ProspectsPage() {
  const { data: businesses = [] } = useQuery({ queryKey: ['businesses'], queryFn: fetchBusinesses });
  const [limit, setLimit] = useState(20);
  const top = businesses.slice(0, limit);
  const best = top[0];
  const reasons: Array<[string, string, LucideIcon]> = [
    ['Strong budget fit', 'Revenue and retainer potential', CircleDollarSign],
    ['Clear digital gap', 'Observed SEO, GBP, or website need', Target],
    ['Reachable business', 'At least one public contact path', UserCheck],
  ];
  return (
    <>
      <PageHeader
        eyebrow="Lead prioritization"
        title="Top prospects"
        description="The businesses most worth contacting, ranked by opportunity, value, and contact readiness."
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              downloadCsv(
                'top-prospects.csv',
                top.map((b) => ({
                  Business: b.name,
                  Niche: b.niche,
                  Score: b.clientScore,
                  Priority: b.priority,
                  Opportunity: b.mainOpportunity,
                  Service: b.recommendedService,
                })),
              )
            }
          >
            <Download size={15} /> Export list
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        {best ? <Card className="relative overflow-hidden bg-[#172A24] p-6 text-white">
          <span className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#5CD3AA]">
            <Trophy size={21} />
          </span>
          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#5CD3AA]">
            Highest priority prospect
          </p>
          <h2 className="mt-3 text-2xl font-bold">{best.name}</h2>
          <p className="mt-1 text-xs text-white/50">
            {best.niche} · {best.area}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div>
              <span className="text-4xl font-extrabold">{best.clientScore}</span>
              <span className="text-sm text-white/40">/100</span>
            </div>
            <div className="h-9 w-px bg-white/10" />
            <div>
              <p className="text-[9px] uppercase text-white/40">Best service to offer</p>
              <p className="mt-1 text-xs font-bold text-[#7BE0BC]">{best.recommendedService || 'Audit required'}</p>
            </div>
          </div>
          <Link
            href={`/businesses/${best.id}`}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-ink"
          >
            View opportunity <MoveRight size={14} />
          </Link>
        </Card> : <Card className="p-8 text-center"><p className="text-sm font-bold">No scored prospects yet</p><p className="mt-2 text-xs text-slate-500">Research and audit a real business to create this ranking.</p></Card>}
        <Card className="p-5">
          <SectionTitle title="Why these leads rank highest" />
          <div className="mt-5 space-y-4">
            {reasons.map(([title, desc, Icon]) => (
              <div key={String(title)} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint text-brand">
                  <Icon size={16} />
                </span>
                <div>
                  <p className="text-xs font-bold">{title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex rounded-xl border bg-white p-1">
          <button
            onClick={() => setLimit(20)}
            className={`rounded-lg px-4 py-2 text-[10px] font-bold ${limit === 20 ? 'bg-ink text-white' : 'text-slate-500'}`}
          >
            Top 20 priority
          </button>
          <button
            onClick={() => setLimit(100)}
            className={`rounded-lg px-4 py-2 text-[10px] font-bold ${limit === 100 ? 'bg-ink text-white' : 'text-slate-500'}`}
          >
            Top 100
          </button>
        </div>
        <p className="text-[10px] text-slate-400">Updated from stored scoring data</p>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {top.map((business, index) => (
          <Card className="group p-4 hover:border-brand/30" key={business.id}>
            <div className="flex gap-4">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold ${index < 3 ? 'bg-mint text-brand' : 'bg-slate-100 text-slate-500'}`}
              >
                #{index + 1}
              </span>
              <Avatar initials={business.initials} color={business.color} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/businesses/${business.id}`}
                      className="text-xs font-bold group-hover:text-brand"
                    >
                      {business.name}
                    </Link>
                    <p className="mt-0.5 text-[9px] text-slate-400">
                      {business.niche} · {business.area}
                    </p>
                  </div>
                  <ScoreRing score={business.clientScore} size={40} />
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-[8px] font-bold uppercase text-slate-400">Why it’s a fit</p>
                    <p className="mt-1 text-[10px] font-medium leading-4">
                      {business.mainOpportunity}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50/70 px-3 py-2">
                    <p className="text-[8px] font-bold uppercase text-emerald-600">
                      Recommended offer
                    </p>
                    <p className="mt-1 text-[10px] font-bold leading-4 text-emerald-800">
                      {business.recommendedService}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <PriorityBadge priority={business.priority} />
                  <div className="flex items-center gap-3">
                    <StatusDot status={business.status} />
                    <Link
                      href={`/businesses/${business.id}`}
                      aria-label={`View details for ${business.name}`}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-brand hover:underline"
                    >
                      Details <MoveRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

const stages: Stage[] = [
  'New Lead',
  'Researching',
  'High Priority',
  'Ready to Contact',
  'Contacted',
  'Follow Up',
  'Replied',
  'Meeting Booked',
  'Qualified',
  'Proposal Sent',
  'Won',
  'Lost',
];
export function PipelinePage() {
  const { notify } = useNotifications();
  const { data: businesses = [] } = useQuery({ queryKey: ['businesses'], queryFn: fetchBusinesses });
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Stage>>({});
  const cards = businesses.map((business) => ({
    ...business,
    status: statusOverrides[business.id] ?? business.status,
  }));
  const [drag, setDrag] = useState<string | null>(null);
  const [followupsOpen, setFollowupsOpen] = useState(false);
  const followups = cards.filter((business) => ['Contacted', 'Follow Up'].includes(business.status));
  const move = async (stage: Stage) => {
    if (!drag) return;
    const movedBusiness = cards.find((business) => business.id === drag);
    const businessId = drag;
    setStatusOverrides((current) => ({ ...current, [businessId]: stage }));
    setDrag(null);
    if (movedBusiness) {
      try {
        await updatePipelineStatus(businessId, stage);
        notify({
          title: `${movedBusiness.name} moved to ${stage}`,
          detail: 'Pipeline status saved.',
          href: `/businesses/${movedBusiness.id}`,
        });
      } catch (caught) {
        setStatusOverrides((current) => ({ ...current, [businessId]: movedBusiness.status }));
        notify({
          title: 'Pipeline update failed',
          detail: caught instanceof Error ? caught.message : 'Could not save the new status.',
          href: '/pipeline',
        });
      }
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Sales workspace"
        title="Prospect pipeline"
        description="Move qualified opportunities from research to a won client without losing the next action."
        actions={
          <>
            <Button variant="secondary" onClick={() => setFollowupsOpen(true)}>
              <Calendar size={15} /> Follow-ups
            </Button>
            <Link href="/research" className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white">
              <Plus size={16} /> Add lead
            </Link>
          </>
        }
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <PipelineMetric
          label="Open pipeline"
          value={cards.filter((b) => !['Won', 'Lost'].includes(b.status)).length}
          icon={<BriefcaseBusiness />}
        />
        <PipelineMetric label="Follow-ups due" value={followups.length} icon={<Calendar />} />
        <PipelineMetric
          label="Won clients"
          value={cards.filter((b) => b.status === 'Won').length}
          icon={<Trophy />}
        />
      </div>
      <div className="overflow-x-auto pb-4 scrollbar-none">
        <div className="flex min-w-max gap-3">
          {stages.map((stage, index) => {
            const inStage = cards.filter((b) => b.status === stage);
            return (
              <div
                key={stage}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => void move(stage)}
                className={`w-[270px] shrink-0 rounded-2xl border p-2 ${drag ? 'bg-emerald-50/30' : 'bg-[#EEF1ED]/60'}`}
              >
                <div className="flex items-center justify-between px-2 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${index < 4 ? 'bg-amber-400' : index < 8 ? 'bg-blue-500' : index === 10 ? 'bg-brand' : index === 11 ? 'bg-slate-400' : 'bg-violet-500'}`}
                    />
                    <h3 className="text-[11px] font-bold">{stage}</h3>
                    <span className="text-[9px] text-slate-400">{inStage.length}</span>
                  </div>
                  <MoreHorizontal size={14} className="text-slate-400" />
                </div>
                <div className="min-h-[420px] space-y-2">
                  {inStage.map((business) => (
                    <div
                      draggable
                      onDragStart={() => setDrag(business.id)}
                      onDragEnd={() => setDrag(null)}
                      key={business.id}
                      className="cursor-grab rounded-xl border bg-white p-3 shadow-sm active:cursor-grabbing"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical size={14} className="mt-1 shrink-0 text-slate-300" />
                        <Avatar initials={business.initials} color={business.color} size="sm" />
                        <div className="min-w-0 flex-1">
                          {business.id.startsWith('prospect-') ? (
                            <Link
                              href={`/businesses/${business.id}`}
                              className="block truncate text-[11px] font-bold hover:text-brand hover:underline"
                            >
                              {business.name}
                            </Link>
                          ) : (
                            <p className="truncate text-[11px] font-bold">{business.name}</p>
                          )}
                          <p className="mt-0.5 text-[9px] text-slate-400">{business.niche}</p>
                        </div>
                        <span className="text-xs font-extrabold text-brand">
                          {business.clientScore}
                        </span>
                      </div>
                      <div className="mt-3 rounded-lg bg-slate-50 p-2">
                        <p className="text-[8px] font-bold uppercase text-slate-400">Next action</p>
                        <p className="mt-1 text-[9px] leading-4 text-slate-600">
                          {business.nextAction}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400">
                        <Link
                          href={
                            business.id.startsWith('prospect-')
                              ? `/businesses/${business.id}`
                              : '/research'
                          }
                          draggable={false}
                          className="font-bold text-brand hover:underline"
                        >
                          {business.id.startsWith('prospect-') ? 'View details' : 'Research lead'}
                        </Link>
                        <span>{business.updatedAt}</span>
                      </div>
                    </div>
                  ))}
                  {!inStage.length && (
                    <div className="flex h-24 items-center justify-center rounded-xl border border-dashed text-[9px] text-slate-400">
                      Drop a prospect here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-[10px] text-slate-400">
        Drag a card between stages. In production, updates are authorized and written to the
        activity log.
      </p>
      {followupsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="followups-title"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/35 p-4 backdrop-blur-sm"
        >
          <Card className="w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 id="followups-title" className="font-bold">Follow-ups due</h2>
                <p className="mt-1 text-[11px] text-slate-500">Contacted leads that need a next action.</p>
              </div>
              <button
                type="button"
                aria-label="Close follow-ups"
                onClick={() => setFollowupsOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>
            {followups.length ? (
              <div className="max-h-96 divide-y overflow-y-auto">
                {followups.map((business) => (
                  <Link
                    key={business.id}
                    href={`/businesses/${business.id}`}
                    onClick={() => setFollowupsOpen(false)}
                    className="flex items-center gap-3 p-4 hover:bg-slate-50"
                  >
                    <Avatar initials={business.initials} color={business.color} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold">{business.name}</span>
                      <span className="mt-0.5 block text-[10px] text-slate-400">
                        {business.nextAction} · {business.updatedAt}
                      </span>
                    </span>
                    <MoveRight size={14} className="text-brand" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="p-8 text-center text-xs text-slate-500">No follow-ups are due.</p>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

function PipelineMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint text-brand [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      <div>
        <p className="text-xl font-extrabold">{value}</p>
        <p className="text-[10px] font-semibold text-slate-500">{label}</p>
      </div>
    </Card>
  );
}

export function OutreachPage() {
  const { notify } = useNotifications();
  const { data: businesses = [] } = useQuery({ queryKey: ['businesses'], queryFn: fetchBusinesses });
  const [selected, setSelected] = useState(businesses[0]?.id ?? '');
  const [type, setType] = useState('Cold email');
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [completed, setCompleted] = useState(false);
  const business = businesses.find((b) => b.id === selected) ?? businesses[0];
  if (!business) {
    return (
      <>
        <PageHeader
          eyebrow="Evidence-based messaging"
          title="Outreach studio"
          description="Turn verified audit findings into short, useful messages."
        />
        <Card className="p-8 text-center">
          <p className="text-sm font-bold">No verified prospect is ready for outreach</p>
          <p className="mt-2 text-xs text-slate-500">Add and audit a real business record first.</p>
        </Card>
      </>
    );
  }
  const messageTypes: Array<[string, LucideIcon]> = [
    ['Cold email', Mail],
    ['LinkedIn message', MessageSquareText],
    ['Short DM', Send],
    ['Call talking points', PhoneCall],
  ];
  const body =
    type === 'LinkedIn message'
      ? `Hi — I was reviewing ${business.niche.toLowerCase()} businesses in San Jose and noticed ${business.mainOpportunity.toLowerCase()} for ${business.name}. I have a few practical ideas that may help. Open to a short audit?`
      : type === 'Short DM'
        ? `Hi ${business.name}! I spotted ${business.mainOpportunity.toLowerCase()}. Happy to send a quick, no-pressure audit with 3 ideas.`
        : `Hi ${business.name} team,\n\nWhile reviewing ${business.niche.toLowerCase()} businesses in San Jose, I noticed ${business.mainOpportunity.toLowerCase()}. I put together a brief audit with three practical ideas that could help improve visibility and enquiries.\n\nWould it be useful if I sent it over?\n\nBest,\nShafiq`;
  const gmailUrl = business.email
    ? gmailComposeUrl({
        to: business.email,
        subject: `A quick idea for ${business.name}`,
        body,
      })
    : null;
  const resetActions = () => {
    setGenerated(false);
    setCopied(false);
    setDraftSaved(false);
    setCompleted(false);
  };
  return (
    <>
      <PageHeader
        eyebrow="Evidence-based messaging"
        title="Outreach studio"
        description="Turn verified audit findings into short, useful messages—without invented claims or generic spam."
      />
      <div className="grid gap-4 xl:grid-cols-[.8fr_1.35fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-bold">1. Choose a prospect</h3>
            <label className="relative mt-4 block">
              <select
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  resetActions();
                }}
                className="h-11 w-full appearance-none rounded-xl border bg-white pl-3 pr-9 text-xs font-bold"
              >
                {businesses.map((b) => (
                  <option value={b.id} key={b.id}>
                    {b.name} · {b.clientScore}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </label>
            <div className="mt-4 flex gap-3 rounded-xl bg-slate-50 p-3">
              <Avatar initials={business.initials} color={business.color} />
              <div>
                <p className="text-xs font-bold">{business.mainOpportunity}</p>
                <p className="mt-1 text-[10px] text-slate-500">
                  Supported by {business.sourceCount} stored sources
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-bold">2. Message type</h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {messageTypes.map(([label, Icon]) => (
                <button
                  onClick={() => {
                    setType(String(label));
                    resetActions();
                  }}
                  key={String(label)}
                  className={`rounded-xl border p-3 text-left ${type === label ? 'border-brand bg-emerald-50/50 ring-1 ring-brand' : 'hover:bg-slate-50'}`}
                >
                  <Icon size={15} className="text-brand" />
                  <p className="mt-2 text-[10px] font-bold">{label}</p>
                </button>
              ))}
            </div>
            <Button
              className="mt-4 w-full"
              onClick={() => {
                setGenerated(true);
                setDraftSaved(false);
                setCompleted(false);
              }}
            >
              <WandSparkles size={15} /> Generate message
            </Button>
          </Card>
        </div>
        <Card className="min-h-[520px] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand">{type}</p>
              <h3 className="mt-1 text-base font-bold">Message preview</h3>
            </div>
            {generated && (
              <Button
                variant="secondary"
                onClick={() => {
                  void navigator.clipboard?.writeText(body);
                  setCopied(true);
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
              </Button>
            )}
          </div>
          {generated ? (
            <>
              <div className="mt-5 rounded-xl border bg-slate-50/70 p-5 text-xs leading-6 whitespace-pre-line">
                {type === 'Cold email' && (
                  <p className="mb-4 border-b pb-3">
                    <strong>Subject:</strong> A quick idea for {business.name}
                  </p>
                )}
                {body}
              </div>
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <p className="flex items-center gap-2 text-[11px] font-bold text-emerald-800">
                  <CheckCircle2 size={14} /> Claim validation passed
                </p>
                <p className="mt-1 text-[10px] leading-4 text-emerald-700">
                  The message references only “{business.mainOpportunity.toLowerCase()},” which is
                  recorded in the current audit.
                </p>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDraftSaved(true);
                    notify({
                      title: `Draft saved for ${business.name}`,
                      detail: 'The outreach draft is ready to continue.',
                      href: '/outreach',
                    });
                  }}
                >
                  {draftSaved ? <Check size={14} /> : <FileText size={14} />}
                  {draftSaved ? 'Draft saved' : 'Save draft'}
                </Button>
                <Button
                  onClick={() => {
                    setCompleted(true);
                    notify({
                      title: `Outreach completed for ${business.name}`,
                      detail: 'The outreach task was marked complete.',
                      href: '/outreach',
                    });
                  }}
                  disabled={completed}
                >
                  <CheckCircle2 size={14} /> {completed ? 'Completed' : 'Mark complete'}
                </Button>
                {gmailUrl ? (
                  <a
                    href={gmailUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="outreach-send-email"
                    onClick={() =>
                      notify({
                        title: `Email prepared for ${business.name}`,
                        detail: 'Your email application was opened with the message.',
                        href: '/outreach',
                      })
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-[#26332f]"
                  >
                    <Send size={14} /> Open in Gmail
                  </a>
                ) : (
                  <button
                    disabled
                    title="No public email is available for this prospect"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-slate-50 px-4 text-sm font-semibold text-slate-400"
                  >
                    <Mail size={14} /> No public email
                  </button>
                )}
              </div>
              {(draftSaved || completed) && (
                <p
                  role="status"
                  className="mt-3 text-right text-[10px] font-semibold text-emerald-700"
                >
                  {completed
                    ? 'Outreach task marked complete.'
                    : 'Draft saved in this outreach workspace.'}
                </p>
              )}
            </>
          ) : (
            <div className="flex min-h-[390px] flex-col items-center justify-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-brand">
                <WandSparkles size={24} />
              </span>
              <h4 className="mt-4 text-sm font-bold">Ready when you are</h4>
              <p className="mt-2 max-w-xs text-[11px] leading-5 text-slate-500">
                Choose a prospect and message type. Northstar will only use weaknesses supported by
                the stored audit.
              </p>
            </div>
          )}
        </Card>
      </div>
      <Card className="mt-4 overflow-hidden">
        <div className="p-5">
          <SectionTitle
            title="Outreach queue"
            subtitle="Drafts and follow-ups across your pipeline"
          />
        </div>
        <div className="divide-y">
          {businesses.slice(2, 7).map((b, index) => (
            <div
              className="grid items-center gap-3 px-5 py-3 sm:grid-cols-[1.3fr_1fr_.7fr_.6fr_auto]"
              key={b.id}
            >
              <div className="flex items-center gap-3">
                <Avatar initials={b.initials} color={b.color} size="sm" />
                <div>
                  <p className="text-[11px] font-bold">{b.name}</p>
                  <p className="text-[9px] text-slate-400">{b.niche}</p>
                </div>
              </div>
              <p className="text-[10px] font-medium">
                {index % 2 ? 'Follow-up email' : 'Local audit opener'}
              </p>
              <span className="text-[10px] text-slate-500">
                {index % 2 ? 'Follow Up' : 'Draft'}
              </span>
              <span className="text-[10px] text-slate-400">{index + 1}d ago</span>
              <MoreHorizontal size={15} className="text-slate-400" />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

export function ReportsPage() {
  const { data: businesses = [] } = useQuery({ queryKey: ['businesses'], queryFn: fetchBusinesses });
  const [generated, setGenerated] = useState<string | null>(null);
  const best = businesses[0];
  const reports: Array<[string, string, LucideIcon]> = [
    ['Market report', 'Best niches, common weaknesses, and opportunity landscape', BarChart3],
    ['Prospect report', 'Top 100 list and detailed Top 20 recommendations', Target],
    ['Niche report', 'Market size, scoring, gaps, and best-fit services', FileBarChart],
    ['Agency strategy', 'Who to target, what to sell, and how to enter', Sparkles],
  ];
  return (
    <>
      <PageHeader
        eyebrow="Decision support"
        title="Reports & strategy"
        description="Generate traceable recommendations from the records in your workspace—never from invented market statistics."
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              downloadCsv(
                'northstar-reports.csv',
                reports.map(([title, description]) => ({ Report: title, Description: description })),
              )
            }
          >
            <Download size={15} /> Export all
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {reports.map(([title, desc, Icon]) => (
          <Card className="p-4" key={String(title)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint text-brand">
              <Icon size={17} />
            </span>
            <h3 className="mt-4 text-xs font-bold">{title}</h3>
            <p className="mt-1 min-h-8 text-[9px] leading-4 text-slate-500">{desc}</p>
            <button
              onClick={() => setGenerated(String(title))}
              className="mt-4 flex items-center gap-1 text-[10px] font-bold text-brand"
            >
              Generate <MoveRight size={12} />
            </button>
          </Card>
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-brand">
                Live recommendation
              </p>
              <h2 className="mt-2 text-xl font-bold">
                {best ? `Start with ${best.niche}` : 'No recommendation available yet'}
              </h2>
            </div>
            <span className="rounded-xl bg-emerald-50 p-3 text-brand">
              <Sparkles size={19} />
            </span>
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-500">
            {best
              ? `The highest stored client score is ${best.clientScore}/100 for ${best.name}. This is a prospect-level direction, not a claim about the wider market.`
              : 'Research and audit real businesses before generating a market recommendation.'}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ReportFact label="Recommended niche" value={best?.niche || 'Unavailable'} note={`${businesses.length} business records`} />
            <ReportFact label="Primary offer" value={best?.recommendedService || 'Audit required'} note="Based on stored scores" />
            <ReportFact label="Main opportunity" value={best?.mainOpportunity || 'Audit required'} note="Review evidence before outreach" />
          </div>
          <div className="mt-5 rounded-xl bg-[#172A24] p-5 text-white">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#61D2AB]">
              Suggested outreach angle
            </p>
            <p className="mt-2 text-sm leading-6">
              {best
                ? `We reviewed the public evidence saved for ${best.name} and prepared a short audit. May I send it over?`
                : 'No outreach angle can be generated without a verified business and retained evidence.'}
            </p>
            <p className="mt-2 text-[9px] text-white/40">
              Uses stored visibility observations; no ranking claim is asserted.
            </p>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <SectionTitle title="Supporting metrics" />
            <div className="mt-4 space-y-4">
              {[
                ['Businesses analyzed', businesses.length, 100],
                [
                  'Excellent opportunities',
                  businesses.filter((b) => b.priority === 'Excellent').length,
                  businesses.length
                    ? (businesses.filter((b) => b.priority === 'Excellent').length /
                        businesses.length) * 100
                    : 0,
                ],
                [
                  'With public contact path',
                  businesses.filter((b) => b.phone || b.email).length,
                  100,
                ],
              ].map(([label, value, width]) => (
                <div key={String(label)}>
                  <div className="mb-2 flex justify-between text-[11px]">
                    <span className="text-slate-500">{label}</span>
                    <strong>{value}</strong>
                  </div>
                  <Progress value={Number(width)} />
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Data confidence" />
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-amber-50 p-4">
              <FileText size={17} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-[11px] font-bold text-amber-900">
                  Directional, not market-representative
                </p>
                <p className="mt-1 text-[10px] leading-4 text-amber-800/70">
                  This report contains {businesses.length} stored records. Niche-wide gap percentages
                  remain gated until each niche reaches the required sample.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {generated && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/35 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-brand">
              <CheckCircle2 size={25} />
            </span>
            <h3 className="mt-4 text-lg font-bold">{generated} is ready</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Generated from {businesses.length} stored records with sample-size caveats
              preserved.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="secondary" onClick={() => setGenerated(null)}>
                Close
              </Button>
              <Button onClick={() => window.print()}>
                <Download size={14} /> Download PDF
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
function ReportFact({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border bg-slate-50/50 p-3">
      <p className="text-[9px] uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
      <p className="mt-1 text-[9px] text-slate-400">{note}</p>
    </div>
  );
}
