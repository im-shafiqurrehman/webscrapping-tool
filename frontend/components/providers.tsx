'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from './auth-provider';
import { NotificationProvider } from './notification-provider';
import { MarketProvider } from './market-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  );
  return (
    <NotificationProvider>
      <MarketProvider>
        <AuthProvider>
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        </AuthProvider>
      </MarketProvider>
    </NotificationProvider>
  );
}
