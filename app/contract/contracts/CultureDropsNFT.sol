// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CultureDropsNFT
 * @dev Culture Drops NFT smart contract for Base blockchain
 * @notice Mints drops as NFTs with metadata and location data
 * 
 * Features:
 *   1. Mint Culture Drop NFTs with metadata
 *   2. Store location, hype score, and engagement metrics
 *   3. Evolution system (upgradeable based on hype)
 *   4. Marketplace functionality for trading
 *   5. Creator royalties and platform fees
 */
contract CultureDropsNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------
    uint256 public constant MAX_TITLE_LEN = 100;
    uint256 public constant MAX_CAPTION_LEN = 500;
    uint256 public constant MAX_CITY_LEN = 50;
    uint256 public constant MAX_COUNTRY_LEN = 50;
    uint256 public constant MAX_BLOB_ID_LEN = 100;
    uint256 public constant MAX_URL_LEN = 200;

    // Evolution thresholds
    uint256 public constant SILVER_THRESHOLD = 10;
    uint256 public constant GOLD_THRESHOLD = 50;
    uint256 public constant PLATINUM_THRESHOLD = 100;
    uint256 public constant DIAMOND_THRESHOLD = 500;

    // Fee constants (in basis points)
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint256 public constant CREATOR_ROYALTY_BPS = 500; // 5%

    // -------------------------------------------------------------------------
    // Structs
    // -------------------------------------------------------------------------

    /// @dev CultureDropData: Metadata for a Culture Drop NFT
    struct CultureDropData {
        string title;
        string caption;
        string city;
        string country;
        string blobId;
        string imageUrl;
        string dropId; // MongoDB reference
        string longitude;
        string latitude;
        uint256 hypeScore;
        uint256 voteCount;
        uint256 commentCount;
        uint8 evolutionLevel; // 0=Bronze, 1=Silver, 2=Gold, 3=Platinum, 4=Diamond
        address creator;
        uint256 mintedAt;
        uint256 basePrice; // Base price in wei (0 = not for sale)
        uint256 currentPrice; // Current price (base_price * hype_multiplier)
        bool forSale;
        uint256 hypeMultiplier; // Multiplier based on hype (1000 = 1.0x)
    }

    // -------------------------------------------------------------------------
    // State Variables
    // -------------------------------------------------------------------------
    uint256 private _tokenIdCounter;
    
    // Mapping from token ID to CultureDropData
    mapping(uint256 => CultureDropData) public cultureDrops;
    
    // Mapping to track minted tokens
    mapping(uint256 => bool) private _mintedTokens;
    
    // Platform fee recipient
    address public platformFeeRecipient;
    
    // Base URI for metadata
    string private _baseTokenURI;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// @dev Emitted when a Culture Drop NFT is minted
    event DropNFTMinted(
        uint256 indexed tokenId,
        string dropId,
        string title,
        string blobId,
        address indexed creator,
        address indexed owner,
        uint256 hypeScore
    );

    /// @dev Emitted when an NFT evolves
    event NFTEvolved(
        uint256 indexed tokenId,
        uint8 oldLevel,
        uint8 newLevel,
        uint256 hypeScore
    );

    /// @dev Emitted when NFT is listed for sale
    event NFTListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 basePrice,
        uint256 currentPrice,
        uint256 hypeMultiplier
    );

    /// @dev Emitted when NFT is purchased
    event NFTPurchased(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 hypeScore
    );

    /// @dev Emitted when NFT is delisted
    event NFTDelisted(
        uint256 indexed tokenId,
        address indexed owner
    );

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    modifier validStringLength(string memory str, uint256 maxLength) {
        require(bytes(str).length <= maxLength, "String too long");
        _;
    }

    modifier onlyNFTOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not NFT owner");
        _;
    }

    modifier nftExists(uint256 tokenId) {
        require(_mintedTokens[tokenId], "NFT does not exist");
        _;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address _platformFeeRecipient
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseTokenURI;
        platformFeeRecipient = _platformFeeRecipient;
    }

    // -------------------------------------------------------------------------
    // Core Functions
    // -------------------------------------------------------------------------

    /**
     * @dev Mint a new Culture Drop NFT
     * @param title The title of the culture drop
     * @param caption The caption/description
     * @param city The city where the drop was created
     * @param country The country where the drop was created
     * @param blobId The Walrus blob storage ID
     * @param imageUrl The image URL
     * @param dropId The MongoDB drop ID for linking
     * @param longitude The longitude coordinate
     * @param latitude The latitude coordinate
     * @param hypeScore The current hype score
     * @param voteCount The number of votes
     * @param commentCount The number of comments
     * @param basePrice The base price in wei (0 = not for sale)
     * @param creatorWallet The verified creator's wallet address
     */
    function mintDrop(
        string memory title,
        string memory caption,
        string memory city,
        string memory country,
        string memory blobId,
        string memory imageUrl,
        string memory dropId,
        string memory longitude,
        string memory latitude,
        uint256 hypeScore,
        uint256 voteCount,
        uint256 commentCount,
        uint256 basePrice,
        address creatorWallet
    ) external 
        validStringLength(title, MAX_TITLE_LEN)
        validStringLength(caption, MAX_CAPTION_LEN)
        validStringLength(city, MAX_CITY_LEN)
        validStringLength(country, MAX_COUNTRY_LEN)
        validStringLength(blobId, MAX_BLOB_ID_LEN)
        validStringLength(imageUrl, MAX_URL_LEN)
    {
        // CRITICAL: Only drop creator can mint
        require(msg.sender == creatorWallet, "Not authorized to mint");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Calculate hype multiplier and current price
        uint256 hypeMultiplier = calculateHypeMultiplier(hypeScore);
        uint256 currentPrice = (basePrice * hypeMultiplier) / 1000;

        // Create CultureDropData
        CultureDropData memory dropData = CultureDropData({
            title: title,
            caption: caption,
            city: city,
            country: country,
            blobId: blobId,
            imageUrl: imageUrl,
            dropId: dropId,
            longitude: longitude,
            latitude: latitude,
            hypeScore: hypeScore,
            voteCount: voteCount,
            commentCount: commentCount,
            evolutionLevel: 0, // Start at Bronze
            creator: msg.sender,
            mintedAt: block.timestamp,
            basePrice: basePrice,
            currentPrice: currentPrice,
            forSale: basePrice > 0,
            hypeMultiplier: hypeMultiplier
        });

        cultureDrops[tokenId] = dropData;
        _mintedTokens[tokenId] = true;

        // Mint the NFT
        _safeMint(msg.sender, tokenId);

        // Emit event
        emit DropNFTMinted(
            tokenId,
            dropId,
            title,
            blobId,
            msg.sender,
            msg.sender,
            hypeScore
        );
    }

    /**
     * @dev Evolve NFT to next level based on hype score
     * @param tokenId The token ID to evolve
     * @param newHypeScore The new hype score
     */
    function evolve(uint256 tokenId, uint256 newHypeScore) 
        external 
        onlyNFTOwner(tokenId)
        nftExists(tokenId)
    {
        CultureDropData storage dropData = cultureDrops[tokenId];
        
        uint8 oldLevel = dropData.evolutionLevel;
        uint8 newLevel = calculateEvolutionLevel(newHypeScore);

        require(newLevel > oldLevel, "Already at max evolution");

        dropData.evolutionLevel = newLevel;
        dropData.hypeScore = newHypeScore;

        emit NFTEvolved(tokenId, oldLevel, newLevel, newHypeScore);
    }

    /**
     * @dev List NFT for sale or update price
     * @param tokenId The token ID to list
     * @param basePrice The new base price in wei
     */
    function listForSale(uint256 tokenId, uint256 basePrice) 
        external 
        onlyNFTOwner(tokenId)
        nftExists(tokenId)
    {
        CultureDropData storage dropData = cultureDrops[tokenId];
        
        dropData.basePrice = basePrice;
        dropData.hypeMultiplier = calculateHypeMultiplier(dropData.hypeScore);
        dropData.currentPrice = (basePrice * dropData.hypeMultiplier) / 1000;
        dropData.forSale = true;

        emit NFTListed(
            tokenId,
            msg.sender,
            basePrice,
            dropData.currentPrice,
            dropData.hypeMultiplier
        );
    }

    /**
     * @dev Delist NFT from sale
     * @param tokenId The token ID to delist
     */
    function delist(uint256 tokenId) 
        external 
        onlyNFTOwner(tokenId)
        nftExists(tokenId)
    {
        CultureDropData storage dropData = cultureDrops[tokenId];
        
        dropData.forSale = false;
        dropData.basePrice = 0;
        dropData.currentPrice = 0;

        emit NFTDelisted(tokenId, msg.sender);
    }

    /**
     * @dev Buy an NFT (price adjusts based on current hype)
     * @param tokenId The token ID to purchase
     */
    function buyNFT(uint256 tokenId) 
        external 
        payable 
        nonReentrant
        nftExists(tokenId)
    {
        CultureDropData storage dropData = cultureDrops[tokenId];
        
        require(dropData.forSale, "NFT not for sale");
        require(msg.sender != ownerOf(tokenId), "Cannot buy own NFT");
        
        address seller = ownerOf(tokenId);
        
        // Recalculate price based on current hype
        dropData.hypeMultiplier = calculateHypeMultiplier(dropData.hypeScore);
        dropData.currentPrice = (dropData.basePrice * dropData.hypeMultiplier) / 1000;
        
        uint256 price = dropData.currentPrice;
        require(msg.value >= price, "Insufficient payment");

        // Calculate fees
        uint256 platformFee = (price * PLATFORM_FEE_BPS) / 10000;
        uint256 creatorRoyalty = (price * CREATOR_ROYALTY_BPS) / 10000;
        
        // Send platform fee
        if (platformFee > 0) {
            (bool platformSuccess, ) = platformFeeRecipient.call{value: platformFee}("");
            require(platformSuccess, "Platform fee transfer failed");
        }
        
        // Send creator royalty (if seller is not the creator)
        if (creatorRoyalty > 0 && seller != dropData.creator) {
            (bool royaltySuccess, ) = dropData.creator.call{value: creatorRoyalty}("");
            require(royaltySuccess, "Creator royalty transfer failed");
        }
        
        // Send remaining amount to seller
        uint256 sellerAmount = price - platformFee - creatorRoyalty;
        (bool sellerSuccess, ) = seller.call{value: sellerAmount}("");
        require(sellerSuccess, "Seller payment transfer failed");

        // Refund excess payment
        if (msg.value > price) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - price}("");
            require(refundSuccess, "Refund transfer failed");
        }

        // Emit purchase event
        emit NFTPurchased(
            tokenId,
            seller,
            msg.sender,
            price,
            dropData.hypeScore
        );

        // Update NFT ownership and delist
        dropData.forSale = false;
        dropData.basePrice = 0;
        dropData.currentPrice = 0;
        
        // Transfer NFT to buyer
        _transfer(seller, msg.sender, tokenId);
    }

    // -------------------------------------------------------------------------
    // Helper Functions
    // -------------------------------------------------------------------------

    /**
     * @dev Calculate evolution level based on hype score
     * @param hypeScore The hype score
     * @return The evolution level (0-4)
     */
    function calculateEvolutionLevel(uint256 hypeScore) public pure returns (uint8) {
        if (hypeScore >= DIAMOND_THRESHOLD) {
            return 4; // Diamond
        } else if (hypeScore >= PLATINUM_THRESHOLD) {
            return 3; // Platinum
        } else if (hypeScore >= GOLD_THRESHOLD) {
            return 2; // Gold
        } else if (hypeScore >= SILVER_THRESHOLD) {
            return 1; // Silver
        } else {
            return 0; // Bronze
        }
    }

    /**
     * @dev Calculate price multiplier based on hype score
     * @param hypeScore The hype score
     * @return The multiplier in basis points (1000 = 1.0x)
     */
    function calculateHypeMultiplier(uint256 hypeScore) public pure returns (uint256) {
        // Base multiplier: 1.0x (1000 basis points)
        uint256 base = 1000;
        
        // Add 10% per 10 hype points
        uint256 bonus = (hypeScore / 10) * 100;
        
        // Cap at 5.0x (5000 basis points) for hype >= 400
        uint256 total = base + bonus;
        if (total > 5000) {
            return 5000;
        } else {
            return total;
        }
    }

    // -------------------------------------------------------------------------
    // Getter Functions
    // -------------------------------------------------------------------------

    /**
     * @dev Get all data for a specific NFT
     * @param tokenId The token ID
     * @return The CultureDropData struct
     */
    function getCultureDropData(uint256 tokenId) 
        external 
        view 
        nftExists(tokenId)
        returns (CultureDropData memory) 
    {
        return cultureDrops[tokenId];
    }

    /**
     * @dev Get the current total supply
     * @return The total number of minted NFTs
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Get the base URI
     * @return The base URI for metadata
     */
    function baseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    // -------------------------------------------------------------------------
    // Admin Functions
    // -------------------------------------------------------------------------

    /**
     * @dev Update platform fee recipient (owner only)
     * @param newRecipient The new fee recipient address
     */
    function updatePlatformFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        platformFeeRecipient = newRecipient;
    }

    /**
     * @dev Update base URI (owner only)
     * @param newBaseURI The new base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    // -------------------------------------------------------------------------
    // Override Functions
    // -------------------------------------------------------------------------

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }


    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }

    // -------------------------------------------------------------------------
    // Emergency Functions
    // -------------------------------------------------------------------------

    /**
     * @dev Emergency withdraw function (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
