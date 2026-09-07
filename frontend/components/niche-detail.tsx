import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, Search, Sparkles, Target } from 'lucide-react';
import { businesses, nicheRows, nicheSlug } from '@/lib/demo-data';
import { Avatar, Card, PageHeader, Progress, ScoreRing, SectionTitle } from './ui';

export function NicheDetail({ slug }: { slug: string }) {
  const niche = nicheRows.find((item) => nicheSlug(item.name) === slug);
  if (!niche) return null;

  const matchingBusinesses = businesses.filter((business) => business.niche === niche.name);
  const opportunities = [
    { label: 'Digital weakness', value: niche.digitalScore, inverse: true },
    { label: 'SEO opportunity', value: niche.seo },
    { label: 'Budget potential', value: niche.budget },
    { label: 'Competition', value: niche.competition, inverse: true },
  ];

  return (
    <>
      <PageHeader
        back="/niches"
        eyebrow="Niche details"
        title={niche.name}
        description={`${niche.industry} opportunity analysis for the San Jose market.`}
        actions={
          <Link
            href="/research"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#26332f]"
          >
            <Search size={15} /> Research this niche
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={BriefcaseBusiness} label="Businesses found" value={niche.businesses} />
        <MetricCard icon={Target} label="Average client score" value={`${niche.averageScore}/100`} />
        <MetricCard icon={Sparkles} label="SEO opportunity" value={`${niche.seo}/10`} />
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Final score
            </p>
            <p className="mt-2 text-sm font-bold text-ink">Market potential</p>
          </div>
          <ScoreRing score={niche.score} size={54} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="overflow-hidden">
          <div className="p-5">
            <SectionTitle
              title={`Businesses in ${niche.name}`}
              subtitle="Open a business to review its audit, scoring, and outreach information."
            />
          </div>
          <div className="divide-y border-t">
            {matchingBusinesses.map((business) => (
              <Link
                key={business.id}
                href={`/businesses/${business.id}`}
                className="group flex items-center gap-3 px-5 py-4 hover:bg-slate-50"
              >
                <Avatar initials={business.initials} color={business.color} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink group-hover:text-brand">
                    {business.name}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-slate-400">
                    {business.area} · {business.mainOpportunity}
                  </span>
                </span>
                <span className="hidden text-right sm:block">
                  <span className="block text-sm font-extrabold text-brand">
                    {business.clientScore}
                  </span>
                  <span className="text-[9px] text-slate-400">Client score</span>
                </span>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-brand" />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle
            title="Opportunity breakdown"
            subtitle="Factors used to calculate the niche ranking."
          />
          <div className="mt-6 space-y-5">
            {opportunities.map((item) => {
              const displayValue = item.inverse ? 10 - item.value : item.value;
              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{item.label}</span>
                    <strong className="text-ink">{item.value}/10</strong>
                  </div>
                  <Progress value={displayValue * 10} />
                </div>
              );
            })}
          </div>
          <div className="mt-6 rounded-xl bg-mint/60 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand">
              Recommended next step
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Review the listed businesses and confirm their public evidence before starting a
              personalized outreach campaign.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="p-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint text-brand">
        <Icon size={17} />
      </span>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
    </Card>
  );
}
