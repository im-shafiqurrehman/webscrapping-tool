'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BusinessDetail } from '@/components/business-detail';
import { fetchBusiness } from '@/lib/api';

export default function BusinessPage() {
  const params = useParams<{ id: string }>();
  const { data, error, isLoading } = useQuery({
    queryKey: ['business', params.id],
    queryFn: () => fetchBusiness(params.id),
    enabled: Boolean(params.id),
  });

  if (isLoading) return <div className="h-48 rounded-2xl skeleton" />;
  if (!data) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-sm text-slate-600">
        {error instanceof Error ? error.message : 'Business not found.'}
      </div>
    );
  }
  return <BusinessDetail business={data} />;
}
