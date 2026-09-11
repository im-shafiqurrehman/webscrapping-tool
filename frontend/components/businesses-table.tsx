'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import type { BusinessRecord } from '@/lib/business-types';
import { deleteBusiness, fetchBusinesses } from '@/lib/api';
import { downloadCsv } from '@/lib/utils';
import { Avatar, Button, Card, PageHeader, PriorityBadge, ScoreRing, StatusDot } from './ui';
import { useNotifications } from './notification-provider';

const exportRow = (b: BusinessRecord) => ({
  'Business Name': b.name,
  Industry: b.industry,
  'Sub-Niche': b.niche,
  Location: `${b.area}, ${b.city}`,
  Website: b.website,
  'Public Business Phone': b.phone,
  'Public Business Email': b.email ?? 'Not Found',
  'Google Rating': b.googleRating,
  'Google Reviews': b.googleReviews,
  'Estimated Employee Size': b.employees,
  'Years in Business': b.years,
  'Website Score': b.websiteScore,
  'SEO Opportunity Score': b.seoOpportunity,
  'Google Business Profile Score': b.gbpOpportunity,
  'Social Media Score': b.socialOpportunity,
  'Marketing Need Score': b.marketingNeed,
  'Potential Client Score': b.clientScore,
  'Priority Level': b.priority,
  'Recommended Service': b.recommendedService,
  'Main Opportunity': b.mainOpportunity,
});

export function BusinessesTable() {
  const { notify } = useNotifications();
  const { data: loadedRows = [], isLoading, error } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses,
  });
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const rows = loadedRows.filter((business) => !deletedIds.has(business.id));
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('All industries');
  const [priority, setPriority] = useState('All priorities');
  const [sort, setSort] = useState('score');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [minimumScore, setMinimumScore] = useState(0);
  const filtered = useMemo(
    () =>
      rows
        .filter(
          (b) =>
            `${b.name} ${b.niche} ${b.area}`.toLowerCase().includes(query.toLowerCase()) &&
            (industry === 'All industries' || b.industry === industry) &&
            (priority === 'All priorities' || b.priority === priority) &&
            b.clientScore >= minimumScore,
        )
        .sort((a, b) =>
          sort === 'score'
            ? b.clientScore - a.clientScore
            : sort === 'reviews'
              ? b.googleReviews - a.googleReviews
              : a.name.localeCompare(b.name),
        ),
    [rows, query, industry, priority, sort, minimumScore],
  );
  const allSelected = filtered.length > 0 && filtered.every((b) => selected.has(b.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map((b) => b.id)));
  return (
    <>
      <PageHeader
        eyebrow="Prospect intelligence"
        title="Businesses"
        description="Research, compare, and prioritize every prospect from one evidence-backed database."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => downloadCsv('northstar-prospects.csv', filtered.map(exportRow))}
            >
              <Download size={15} /> Export CSV
            </Button>
            <Link href="/research" className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white">
              <Plus size={16} /> Add business
            </Link>
          </>
        }
      />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-xl border bg-white pl-9 pr-9 text-xs outline-none focus:ring-2 focus:ring-brand/15"
              placeholder="Search name, niche, or area…"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X size={14} className="text-slate-400" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={industry}
              onChange={setIndustry}
              options={['All industries', ...Array.from(new Set(rows.map((b) => b.industry)))]}
            />
            <Select
              value={priority}
              onChange={setPriority}
              options={['All priorities', 'Excellent', 'High', 'Medium', 'Low']}
            />
            <Select
              value={sort}
              onChange={setSort}
              options={['score', 'reviews', 'name']}
              labels={['Score: high to low', 'Most reviews', 'Business name']}
            />
            <Button
              variant="secondary"
              className="px-3"
              aria-expanded={moreFiltersOpen}
              onClick={() => setMoreFiltersOpen((current) => !current)}
            >
              <SlidersHorizontal size={15} /> More filters
            </Button>
          </div>
        </div>
        {moreFiltersOpen && (
          <div className="flex flex-col gap-3 border-b bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center">
            <label className="flex flex-1 items-center gap-3 text-[11px] font-semibold text-slate-600">
              Minimum client score
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minimumScore}
                onChange={(event) => setMinimumScore(Number(event.target.value))}
                className="max-w-xs flex-1 accent-emerald-700"
              />
              <strong className="w-8 text-ink">{minimumScore}</strong>
            </label>
            <button
              type="button"
              onClick={() => setMinimumScore(0)}
              className="text-left text-[10px] font-bold text-brand hover:underline"
            >
              Clear advanced filters
            </button>
          </div>
        )}
        <div className="flex h-11 items-center justify-between border-b bg-slate-50/50 px-4 text-[11px] text-slate-500">
          <span>
            <strong className="text-ink">{filtered.length}</strong> businesses · San Jose,
            California
          </span>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span>{selected.size} selected</span>
              <button
                onClick={async () => {
                  const ids = [...selected];
                  try {
                    await Promise.all(ids.map(deleteBusiness));
                    setDeletedIds((current) => new Set([...current, ...ids]));
                    setSelected(new Set());
                    notify({ title: 'Businesses deleted', detail: `${ids.length} record(s) removed.`, href: '/businesses' });
                  } catch (caught) {
                    notify({
                      title: 'Delete failed',
                      detail: caught instanceof Error ? caught.message : 'Could not delete records.',
                      href: '/businesses',
                    });
                  }
                }}
                className="flex items-center gap-1 font-semibold text-coral"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left">
            <thead>
              <tr className="h-11 border-b bg-white text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <th className="w-12 px-4">
                  <CheckBox checked={allSelected} onChange={toggleAll} />
                </th>
                <th>Business</th>
                <th>Niche / area</th>
                <th>Google</th>
                <th>Website</th>
                <th>SEO opp.</th>
                <th>GBP opp.</th>
                <th>Social opp.</th>
                <th>Marketing need</th>
                <th>Client score</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((business) => (
                <tr key={business.id} className="group h-[70px] hover:bg-[#F9FBF9]">
                  <td className="px-4">
                    <CheckBox
                      checked={selected.has(business.id)}
                      onChange={() =>
                        setSelected((current) => {
                          const next = new Set(current);
                          if (next.has(business.id)) next.delete(business.id);
                          else next.add(business.id);
                          return next;
                        })
                      }
                    />
                  </td>
                  <td>
                    <Link href={`/businesses/${business.id}`} className="flex items-center gap-2.5">
                      <Avatar size="sm" initials={business.initials} color={business.color} />
                      <span>
                        <span className="block max-w-[170px] truncate text-[11px] font-bold group-hover:text-brand">
                          {business.name}
                        </span>
                        <span className="mt-0.5 block text-[9px] text-slate-400">
                          {business.businessSize} · {business.employees} employees
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td>
                    <span className="block text-[11px] font-medium text-slate-650">
                      {business.niche}
                    </span>
                    <span className="text-[9px] text-slate-400">{business.area}</span>
                  </td>
                  <td>
                    <span className="text-[11px] font-bold">★ {business.googleRating}</span>
                    <span className="ml-1 text-[9px] text-slate-400">
                      ({business.googleReviews})
                    </span>
                  </td>
                  <ScoreCell value={business.websiteScore} quality />
                  <ScoreCell value={business.seoOpportunity} />
                  <ScoreCell value={business.gbpOpportunity} />
                  <ScoreCell value={business.socialOpportunity} />
                  <td>
                    <span className="text-[11px] font-bold">{business.marketingNeed}/15</span>
                  </td>
                  <td>
                    <ScoreRing score={business.clientScore} size={40} />
                  </td>
                  <td>
                    <PriorityBadge priority={business.priority} />
                  </td>
                  <td>
                    <StatusDot status={business.status} />
                  </td>
                  <td>
                    <Link
                      href={`/businesses/${business.id}`}
                      aria-label={`View details for ${business.name}`}
                      className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-ink"
                    >
                      <MoreHorizontal size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && !filtered.length && (
            <div className="p-14 text-center">
              <Filter className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-bold">No business records found</p>
              <p className="mt-1 text-xs text-slate-400">
                {error instanceof Error ? error.message : 'Run live research or import verified records.'}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3 text-[11px] text-slate-500">
          <span>
            Showing {filtered.length ? 1 : 0}–{filtered.length} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button disabled className="rounded-lg border p-1.5 opacity-40">
              <ChevronLeft size={14} />
            </button>
            <button disabled className="h-7 w-7 rounded-lg bg-ink font-bold text-white">1</button>
            <button disabled className="rounded-lg border p-1.5 opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Card>
    </>
  );
}

function Select({
  value,
  onChange,
  options,
  labels,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: string[];
}) {
  return (
    <label className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 appearance-none rounded-xl border bg-white pl-3 pr-8 text-[11px] font-semibold outline-none focus:ring-2 focus:ring-brand/15"
      >
        {options.map((item, i) => (
          <option key={item} value={item}>
            {labels?.[i] ?? item}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </label>
  );
}
function CheckBox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`flex h-4 w-4 items-center justify-center rounded border ${checked ? 'border-brand bg-brand text-white' : 'bg-white'}`}
    >
      {checked && <Check size={11} />}
    </button>
  );
}
function ScoreCell({ value, quality }: { value: number; quality?: boolean }) {
  const positive = quality ? value >= 7 : value <= 4;
  const alert = quality ? value <= 5 : value >= 8;
  return (
    <td>
      <div className="flex items-center gap-2">
        <span
          className={`text-[11px] font-bold ${alert ? 'text-coral' : positive ? 'text-brand' : 'text-slate-650'}`}
        >
          {value}/10
        </span>
        <span className="h-1 w-8 overflow-hidden rounded bg-slate-100">
          <span
            className={`block h-full rounded ${alert ? 'bg-coral' : positive ? 'bg-brand' : 'bg-amber'}`}
            style={{ width: `${value * 10}%` }}
          />
        </span>
      </div>
    </td>
  );
}
