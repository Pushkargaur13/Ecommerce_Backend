'use client';
import React from 'react';
import { SWRConfig } from 'swr';
import { Provider as JotaiProvider } from 'jotai';
import { swrFetcher } from '../lib/swrFetcher';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <SWRConfig value={{ fetcher: swrFetcher }}>
        {children}
      </SWRConfig>
    </JotaiProvider>
  );
}