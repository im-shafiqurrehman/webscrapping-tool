'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useAuth } from './auth-provider';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace('/login');
  }, [ready, router, user]);

  if (!ready || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <Sparkles className="animate-pulse text-brand" size={20} /> Checking your session…
        </div>
      </main>
    );
  }

  return children;
}
