import { notFound } from 'next/navigation';
import { NicheDetail } from '@/components/niche-detail';
import { nicheRows, nicheSlug } from '@/lib/demo-data';

export function generateStaticParams() {
  return nicheRows.map((niche) => ({ slug: nicheSlug(niche.name) }));
}

export default async function NichePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!nicheRows.some((niche) => nicheSlug(niche.name) === slug)) notFound();
  return <NicheDetail slug={slug} />;
}
