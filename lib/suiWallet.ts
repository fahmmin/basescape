import { createNetworkConfig } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';

// Configure Sui networks
const { networkConfig, useNetworkVariable } = createNetworkConfig({
    testnet: {
        url: getFullnodeUrl('testnet'),
    },
    mainnet: {
        url: getFullnodeUrl('mainnet'),
    },
    devnet: {
        url: getFullnodeUrl('devnet'),
    },
});

export { networkConfig, useNetworkVariable };

// Get the active network from environment
export const ACTIVE_NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK as 'testnet' | 'mainnet' | 'devnet') || 'testnet';

