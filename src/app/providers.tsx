
'use client';

import type { ReactNode } from 'react';
import { I18nProvider } from '@/hooks/use-i18n';
import { NotificationsProvider } from '@/hooks/use-notifications';
import { FarcasterIdentityProvider } from '@/hooks/use-farcaster-identity';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster as HotToaster } from 'react-hot-toast';


const queryClient = new QueryClient();

const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <FarcasterIdentityProvider>
            <NotificationsProvider>
              {children}
              <HotToaster />
            </NotificationsProvider>
          </FarcasterIdentityProvider>
        </I18nProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
