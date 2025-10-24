'use client';

import { Wallet } from 'lucide-react';
import { useWallet } from '@/lib/walletContext';

interface BaseWalletConnectProps {
    onAccountChange?: (account: string | null) => void;
}

export function BaseWalletConnect({ onAccountChange }: BaseWalletConnectProps) {
    const { account, connect, disconnect } = useWallet();

    const connectWallet = async () => {
        try {
            await connect();
            onAccountChange?.(account);
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            alert('Failed to connect wallet. Please try again.');
        }
    };

    const disconnectWallet = () => {
        disconnect();
        onAccountChange?.(null);
    };

    return (
        <div className="flex items-center gap-2">
            {account ? (
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#97F0E5]/10 border border-[#97F0E5] rounded-md">
                        <Wallet size={16} className="text-[#97F0E5]" />
                        <span className="text-sm font-neuebit text-[#F7F7F7]">
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </span>
                    </div>
                    <button
                        onClick={disconnectWallet}
                        className="bg-[#C684F6] hover:bg-[#C684F6]/80 text-[#0C0F1D] font-neuebit px-4 py-2 rounded-md transition-colors"
                    >
                        Disconnect
                    </button>
                </div>
            ) : (
                <button
                    onClick={connectWallet}
                    className="bg-[#97F0E5] hover:bg-[#97F0E5]/80 text-[#0C0F1D] font-neuebit px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                >
                    <Wallet size={16} />
                    <span>Connect Wallet</span>
                </button>
            )}
        </div>
    );
}
