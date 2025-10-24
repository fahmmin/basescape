'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

// Extend Window interface to include ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}

interface WalletContextType {
    account: string | null;
    isConnected: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<string | null>(null);

    // Check if wallet is already connected
    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const accounts = await provider.listAccounts();
                    if (accounts.length > 0) {
                        setAccount(accounts[0].address);
                    }
                } catch (error) {
                    console.error('Error checking wallet connection:', error);
                }
            }
        };

        checkConnection();

        // Listen for account changes
        if (window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    setAccount(null);
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, []);

    const connect = async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
            throw new Error('Please install MetaMask to connect your wallet');
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send('eth_requestAccounts', []);

            if (accounts.length > 0) {
                setAccount(accounts[0]);
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        }
    };

    const disconnect = () => {
        setAccount(null);
    };

    const value = {
        account,
        isConnected: !!account,
        connect,
        disconnect,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}

// Compatibility hooks for components that expect Sui-style hooks
export function useCurrentAccount() {
    const { account } = useWallet();
    return account ? { address: account } : null;
}

export function useSignPersonalMessage() {
    const { account } = useWallet();

    return {
        mutateAsync: async ({ message }: { message: Uint8Array }) => {
            if (!account) {
                throw new Error('Wallet not connected');
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const messageString = new TextDecoder().decode(message);
            const signature = await signer.signMessage(messageString);

            return { signature };
        }
    };
}
