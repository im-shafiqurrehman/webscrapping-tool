import { notFound } from 'next/navigation';
import { BusinessDetail } from '@/components/business-detail';
import { businesses } from '@/lib/demo-data';

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = businesses.find((item) => item.id === id);
  if (!business) notFound();
  return <BusinessDetail business={business} />;
}
