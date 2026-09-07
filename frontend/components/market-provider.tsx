'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface Market {
  id: string;
  city: string;
  region: string;
  country: string;
  areas: string[];
}

export interface NewMarket {
  city: string;
  region: string;
  country: string;
  areas: string[];
}

interface MarketContextValue {
  markets: Market[];
  activeMarket: Market;
  addMarket: (market: NewMarket) => Market;
  selectMarket: (id: string) => void;
}

const defaultMarket: Market = {
  id: 'san-jose-us',
  city: 'San Jose',
  region: 'California',
  country: 'United States',
  areas: ['Downtown', 'North San Jose', 'South San Jose', 'East San Jose', 'West San Jose'],
};

const storageKey = 'northstar-markets';
const activeStorageKey = 'northstar-active-market';
const MarketContext = createContext<MarketContextValue | null>(null);

function createMarketId(market: NewMarket) {
  const location = `${market.city}-${market.region}-${market.country}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${location}-${Date.now()}`;
}

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [markets, setMarkets] = useState<Market[]>([defaultMarket]);
  const [activeMarketId, setActiveMarketId] = useState(defaultMarket.id);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const savedMarkets = window.localStorage.getItem(storageKey);
        const savedActiveMarket = window.localStorage.getItem(activeStorageKey);
        if (savedMarkets) {
          const parsed = JSON.parse(savedMarkets) as Market[];
          if (Array.isArray(parsed) && parsed.length) setMarkets(parsed);
        }
        if (savedActiveMarket) setActiveMarketId(savedActiveMarket);
      } catch {
        window.localStorage.removeItem(storageKey);
        window.localStorage.removeItem(activeStorageKey);
      } finally {
        setHydrated(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(markets));
    window.localStorage.setItem(activeStorageKey, activeMarketId);
  }, [activeMarketId, hydrated, markets]);

  const activeMarket = markets.find((market) => market.id === activeMarketId) ?? markets[0] ?? defaultMarket;
  const value = useMemo<MarketContextValue>(
    () => ({
      markets,
      activeMarket,
      addMarket: (input) => {
        const market = { ...input, id: createMarketId(input) };
        setMarkets((current) => [...current, market]);
        setActiveMarketId(market.id);
        return market;
      },
      selectMarket: setActiveMarketId,
    }),
    [activeMarket, markets],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarkets() {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarkets must be used within MarketProvider');
  return context;
}
