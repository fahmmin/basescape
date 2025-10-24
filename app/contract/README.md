# Culture Drops NFT Smart Contracts

This repository contains the smart contracts for the Culture Drops NFT project, built for the Base blockchain.

## Overview

The Culture Drops NFT contract allows users to:
- Mint NFTs representing cultural drops with metadata
- Store location, hype score, and engagement metrics
- Implement an evolution system based on hype scores
- Trade NFTs through a built-in marketplace
- Support creator royalties and platform fees

## Features

- **ERC721 Compliant**: Standard NFT functionality
- **Metadata Storage**: Rich metadata including location, hype scores, and engagement metrics
- **Evolution System**: NFTs can evolve based on hype scores (Bronze → Silver → Gold → Platinum → Diamond)
- **Dynamic Pricing**: Prices adjust based on hype multipliers
- **Marketplace**: Built-in buying/selling functionality
- **Creator Royalties**: 5% royalty to original creators
- **Platform Fees**: 2.5% platform fee
- **Access Control**: Only verified creators can mint NFTs

## Contract Architecture

### CultureDropsNFT.sol
Main contract implementing:
- NFT minting with rich metadata
- Evolution system
- Marketplace functionality
- Fee distribution
- Access controls

## Setup

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Hardhat
- Base Sepolia testnet ETH for deployment

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Update `.env` with your values:
```
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
```

### Compilation

```bash
npm run compile
```

### Testing

```bash
npm test
```

## Deployment

### Base Sepolia (Testnet)

1. Get Base Sepolia ETH from the [Base faucet](https://bridge.base.org/deposit)
2. Deploy to Base Sepolia:
```bash
npm run deploy:base-sepolia
```

3. Verify contract on BaseScan:
```bash
npm run verify:base-sepolia
```

### Base Mainnet

1. Deploy to Base mainnet:
```bash
npm run deploy:base
```

2. Verify contract on BaseScan:
```bash
npm run verify:base
```

## Contract Functions

### Core Functions

#### `mintDrop(...)`
Mints a new Culture Drop NFT with metadata.

**Parameters:**
- `title`: The title of the culture drop
- `caption`: Description of the drop
- `city`: City where drop was created
- `country`: Country where drop was created
- `blobId`: Walrus blob storage ID
- `imageUrl`: Image URL
- `dropId`: MongoDB drop ID for linking
- `longitude`: Longitude coordinate
- `latitude`: Latitude coordinate
- `hypeScore`: Current hype score
- `voteCount`: Number of votes
- `commentCount`: Number of comments
- `basePrice`: Base price in wei (0 = not for sale)
- `creatorWallet`: Verified creator's wallet address

#### `evolve(tokenId, newHypeScore)`
Evolves an NFT to the next level based on hype score.

#### `listForSale(tokenId, basePrice)`
Lists an NFT for sale with a base price.

#### `delist(tokenId)`
Removes an NFT from sale.

#### `buyNFT(tokenId)`
Purchases a listed NFT (payable function).

### Helper Functions

#### `calculateEvolutionLevel(hypeScore)`
Returns evolution level (0-4) based on hype score:
- 0: Bronze (0-9 hype)
- 1: Silver (10-49 hype)
- 2: Gold (50-99 hype)
- 3: Platinum (100-499 hype)
- 4: Diamond (500+ hype)

#### `calculateHypeMultiplier(hypeScore)`
Returns price multiplier in basis points:
- Base: 1.0x (1000 basis points)
- +10% per 10 hype points
- Capped at 5.0x (5000 basis points)

### Admin Functions

#### `updatePlatformFeeRecipient(newRecipient)`
Updates the platform fee recipient address (owner only).

#### `setBaseURI(newBaseURI)`
Updates the base URI for metadata (owner only).

#### `emergencyWithdraw()`
Emergency function to withdraw contract balance (owner only).

## Events

- `DropNFTMinted`: Emitted when an NFT is minted
- `NFTEvolved`: Emitted when an NFT evolves
- `NFTListed`: Emitted when an NFT is listed for sale
- `NFTPurchased`: Emitted when an NFT is purchased
- `NFTDelisted`: Emitted when an NFT is delisted

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Access Control**: Only verified creators can mint
- **Input Validation**: String length limits and parameter validation
- **Safe Transfers**: Proper handling of ETH transfers
- **Emergency Functions**: Owner can withdraw funds in emergencies

## Fee Structure

- **Platform Fee**: 2.5% (250 basis points)
- **Creator Royalty**: 5% (500 basis points)
- **Seller Receives**: Remaining amount after fees

## Network Information

### Base Sepolia
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Faucet**: https://bridge.base.org/deposit

### Base Mainnet
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Explorer**: https://basescan.org

## Integration

### Frontend Integration

```javascript
// Example: Mint a new drop
const tx = await cultureDropsNFT.mintDrop(
  "Amazing Culture Drop",
  "This is an amazing culture drop",
  "New York",
  "USA",
  "blob_12345",
  "https://example.com/image.jpg",
  "drop_67890",
  "-74.0060",
  "40.7128",
  25, // hype score
  10, // vote count
  5,  // comment count
  ethers.parseEther("0.1"), // base price
  creatorAddress
);
```

### Event Listening

```javascript
// Listen for mint events
cultureDropsNFT.on("DropNFTMinted", (tokenId, dropId, title, blobId, creator, owner, hypeScore) => {
  console.log(`NFT ${tokenId} minted: ${title}`);
});
```

## License

MIT License - see LICENSE file for details.

## Support

For questions or support, please contact the Culture Drops team.
