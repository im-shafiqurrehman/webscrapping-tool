'use client';

import { useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  Database,
  Globe2,
  KeyRound,
  Mail,
  MapPin,
  Plus,
  Save,
  Shield,
  SlidersHorizontal,
  UsersRound,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, Card, PageHeader, SectionTitle } from './ui';
import { useNotifications } from './notification-provider';
import { useMarkets, type NewMarket } from './market-provider';
import { useAuth } from './auth-provider';

const initialWeights = {
  'Revenue & budget': 20,
  'SEO opportunity': 20,
  'Website improvement': 15,
  'GBP opportunity': 15,
  'Marketing need': 15,
  'Ease of contact': 5,
  'Competition opportunity': 10,
};
export function SettingsPage({ initialTab = 'Scoring' }: { initialTab?: string }) {
  const { notify } = useNotifications();
  const { user } = useAuth();
  const { activeMarket, addMarket, markets, selectMarket } = useMarkets();
  const [tab, setTab] = useState(initialTab);
  const [marketDialogOpen, setMarketDialogOpen] = useState(false);
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
              notify({
                title: 'Settings saved',
                detail: 'Workspace scoring settings were updated.',
                href: '/settings',
              });
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
                {user && [[
                  user.name,
                  user.email,
                  user.role,
                  user.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
                ]].map(([name, email, role, initials]) => (
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
              <Button
                disabled
                title="Team invitations require the production user-management service"
                className="mt-4"
              >
                <Plus size={15} /> Invitations not configured
              </Button>
            </Card>
          )}
          {tab === 'Markets' && (
            <Card className="p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <SectionTitle
                  title="Markets & locations"
                  subtitle="Add cities, regions, countries, and service areas for research."
                />
                <Button variant="secondary" onClick={() => setMarketDialogOpen(true)}>
                  <Plus size={15} /> Add market
                </Button>
              </div>
              <div className="mt-5 grid gap-3 xl:grid-cols-2">
                {markets.map((market) => {
                  const active = market.id === activeMarket.id;
                  return (
                    <button
                      key={market.id}
                      type="button"
                      onClick={() => selectMarket(market.id)}
                      className={`rounded-xl border p-5 text-left transition hover:border-brand/30 ${active ? 'border-brand/40 bg-emerald-50/30 ring-1 ring-brand/10' : ''}`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-brand">
                          <MapPin size={18} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold">
                            {market.city}, {market.region}
                          </span>
                          <span className="mt-0.5 block text-[9px] text-slate-400">
                            {market.country}
                          </span>
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-bold ${active ? 'bg-emerald-50 text-brand' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {active ? 'Active' : 'Select'}
                        </span>
                      </span>
                      <span className="mt-4 flex flex-wrap gap-2">
                        {market.areas.length ? (
                          market.areas.map((area) => (
                            <span
                              className="rounded-lg border bg-white px-2.5 py-1.5 text-[9px] font-semibold text-slate-600"
                              key={area}
                            >
                              {area}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-slate-400">Entire city</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Button
                onClick={() => setMarketDialogOpen(true)}
                className="mt-4"
              >
                <Plus size={15} /> Add another market
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
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint text-brand">
                    <Mail size={17} />
                  </span>
                  <p className="mt-3 text-xs font-bold">Gmail compose</p>
                  <p className="mt-1 text-[9px] leading-4 text-slate-500">
                    Opens Gmail with the verified recipient, subject, and message pre-filled.
                    Sending still requires confirmation in Gmail.
                  </p>
                  <span className="mt-4 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold text-brand">
                    Enabled
                  </span>
                </div>
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
                    <Button
                      variant="secondary"
                      disabled
                      title="Provider credentials must be configured on the backend"
                      className="mt-4 h-8 px-3 text-[10px]"
                    >
                      <KeyRound size={12} /> Not configured
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
      {marketDialogOpen && (
        <AddMarketDialog
          onClose={() => setMarketDialogOpen(false)}
          onAdd={(input) => {
            const market = addMarket(input);
            setMarketDialogOpen(false);
            notify({
              title: `${market.city} market added`,
              detail: `${market.country} is now the active research market.`,
              href: '/research',
            });
          }}
        />
      )}
    </>
  );
}

function AddMarketDialog({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (market: NewMarket) => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-market-title"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/35 p-4 backdrop-blur-sm"
    >
      <Card className="w-full max-w-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="add-market-title" className="text-lg font-bold">Add a research market</h2>
            <p className="mt-1 text-xs text-slate-500">
              Configure a city in the USA, UK, or another supported country.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close add market"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const city = String(form.get('city')).trim();
            const region = String(form.get('region')).trim();
            const country = String(form.get('country')).trim();
            const areas = String(form.get('areas'))
              .split(',')
              .map((area) => area.trim())
              .filter(Boolean);
            if (!city || !region || !country) return;
            onAdd({ city, region, country, areas });
          }}
        >
          <label>
            <span className="mb-1.5 block text-[11px] font-bold text-slate-600">Country</span>
            <select
              name="country"
              aria-label="Market country"
              defaultValue="United Kingdom"
              className="h-11 w-full rounded-xl border bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-brand/15"
            >
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Australia</option>
              <option>United Arab Emirates</option>
              <option>Pakistan</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] font-bold text-slate-600">City</span>
            <input
              name="city"
              required
              aria-label="Market city"
              placeholder="e.g. London"
              className="h-11 w-full rounded-xl border px-3 text-xs outline-none focus:ring-2 focus:ring-brand/15"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-[11px] font-bold text-slate-600">Region / state</span>
            <input
              name="region"
              required
              aria-label="Market region"
              placeholder="e.g. Greater London"
              className="h-11 w-full rounded-xl border px-3 text-xs outline-none focus:ring-2 focus:ring-brand/15"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-[11px] font-bold text-slate-600">
              Areas (comma separated)
            </span>
            <input
              name="areas"
              aria-label="Market areas"
              placeholder="Westminster, Camden, Islington"
              className="h-11 w-full rounded-xl border px-3 text-xs outline-none focus:ring-2 focus:ring-brand/15"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit"><Plus size={15} /> Add and select market</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
