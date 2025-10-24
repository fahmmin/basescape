'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { WalletProvider } from '@/lib/walletContext';

export function BaseProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <WalletProvider>
                {children}
            </WalletProvider>
        </QueryClientProvider>
    );
}
