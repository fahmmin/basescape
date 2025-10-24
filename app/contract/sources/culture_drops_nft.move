// ========================================================================
// Module: culture_drops_nft
//
// Culture Drops NFT smart contract for Sui blockchain
// Mints drops as NFTs with Walrus blob storage and location data
//
// Features:
//   1. Mint Culture Drop NFTs with image from Walrus
//   2. Store location, hype score, and engagement metrics
//   3. Display standard for beautiful wallet visualization
//   4. Evolution system (upgradeable based on hype)
//   5. Optional marketplace for trading
// ========================================================================

module culture_drops::nft {
    use std::string::{Self, String};
    use sui::event;
    use sui::display;
    use sui::package;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    // -------------------------------------------------------------------------
    // Error Codes
    // -------------------------------------------------------------------------
    const E_NOT_OWNER: u64 = 0;
    const E_ALREADY_EVOLVED: u64 = 1;
    const E_INSUFFICIENT_HYPE: u64 = 2;
    const E_INVALID_METADATA: u64 = 3;
    const E_NOT_FOR_SALE: u64 = 4;
    const E_INSUFFICIENT_PAYMENT: u64 = 5;
    const E_ALREADY_LISTED: u64 = 6;

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------
    const MAX_TITLE_LEN: u64 = 100;
    const MAX_CAPTION_LEN: u64 = 500;
    const MAX_CITY_LEN: u64 = 50;
    const MAX_COUNTRY_LEN: u64 = 50;
    const MAX_BLOB_ID_LEN: u64 = 100;
    const MAX_URL_LEN: u64 = 200;

    // Evolution thresholds
    const SILVER_THRESHOLD: u64 = 10;
    const GOLD_THRESHOLD: u64 = 50;
    const PLATINUM_THRESHOLD: u64 = 100;
    const DIAMOND_THRESHOLD: u64 = 500;

    // -------------------------------------------------------------------------
    // One-Time-Witness for Display
    // -------------------------------------------------------------------------
    public struct NFT has drop {}

    // -------------------------------------------------------------------------
    // Structs
    // -------------------------------------------------------------------------

    /// CultureDropNFT: Main NFT struct representing a Culture Drop
    public struct CultureDropNFT has key, store {
        id: UID,
        
        // Drop metadata
        title: String,
        caption: String,
        city: String,
        country: String,
        
        // Walrus blob data
        blob_id: String,
        image_url: String,
        
        // MongoDB reference (for linking)
        drop_id: String,
        
        // Location coordinates (for future use)
        longitude: String,  // Stored as string to preserve precision
        latitude: String,
        
        // Metrics snapshot (at mint time)
        hype_score: u64,
        vote_count: u64,
        comment_count: u64,
        
        // Evolution system
        evolution_level: u8,  // 0=Bronze, 1=Silver, 2=Gold, 3=Platinum, 4=Diamond
        
        // Creator info
        creator: address,
        minted_at: u64,  // Epoch
        
        // Ownership
        owner: address,
        
        // Marketplace (dynamic pricing)
        base_price: u64,      // Base price set by creator (in MIST)
        current_price: u64,   // Current price (base_price * hype_multiplier)
        for_sale: bool,       // Listing status
        hype_multiplier: u64, // Multiplier based on hype (1000 = 1.0x)
    }

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// Emitted when a Culture Drop NFT is minted
    public struct DropNFTMinted has copy, drop {
        nft_id: ID,
        drop_id: String,
        title: String,
        blob_id: String,
        creator: address,
        owner: address,
        hype_score: u64,
    }

    /// Emitted when an NFT evolves
    public struct NFTEvolved has copy, drop {
        nft_id: ID,
        old_level: u8,
        new_level: u8,
        hype_score: u64,
    }

    /// Emitted when NFT is listed for sale
    public struct NFTListed has copy, drop {
        nft_id: ID,
        seller: address,
        base_price: u64,
        current_price: u64,
        hype_multiplier: u64,
    }

    /// Emitted when NFT is purchased
    public struct NFTPurchased has copy, drop {
        nft_id: ID,
        seller: address,
        buyer: address,
        price: u64,
        hype_score: u64,
    }

    /// Emitted when NFT is delisted
    public struct NFTDelisted has copy, drop {
        nft_id: ID,
        owner: address,
    }

    // -------------------------------------------------------------------------
    // Init Function
    // -------------------------------------------------------------------------

    /// Initialize the module and set up Display standard
    fun init(otw: NFT, ctx: &mut TxContext) {
        // Create publisher for Display
        let publisher = package::claim(otw, ctx);

        // Create Display object for beautiful wallet visualization
        let mut display = display::new<CultureDropNFT>(&publisher, ctx);

        // Set display fields (how NFT appears in wallets)
        display::add(&mut display, b"name".to_string(), b"{title}".to_string());
        display::add(&mut display, b"description".to_string(), b"{caption}".to_string());
        display::add(&mut display, b"image_url".to_string(), b"{image_url}".to_string());
        display::add(&mut display, b"location".to_string(), b"{city}, {country}".to_string());
        display::add(&mut display, b"hype_score".to_string(), b"{hype_score}".to_string());
        display::add(&mut display, b"evolution".to_string(), b"Level {evolution_level}".to_string());
        display::add(&mut display, b"blob_id".to_string(), b"{blob_id}".to_string());
        display::add(&mut display, b"project_url".to_string(), b"https://culturedrops.app".to_string());

        // Update and share
        display::update_version(&mut display);
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
    }

    // -------------------------------------------------------------------------
    // Core Functions
    // -------------------------------------------------------------------------

    /// Mint a new Culture Drop NFT with optional base price
    /// IMPORTANT: Only the original drop creator can mint!
    public entry fun mint_drop(
        title: String,
        caption: String,
        city: String,
        country: String,
        blob_id: String,
        image_url: String,
        drop_id: String,
        longitude: String,
        latitude: String,
        hype_score: u64,
        vote_count: u64,
        comment_count: u64,
        base_price: u64,  // Base price in MIST (0 = not for sale)
        creator_wallet: address,  // NEW! Drop creator's wallet (verified off-chain)
        ctx: &mut TxContext
    ) {
        // Validate lengths
        assert!(string::length(&title) <= MAX_TITLE_LEN, E_INVALID_METADATA);
        assert!(string::length(&caption) <= MAX_CAPTION_LEN, E_INVALID_METADATA);
        assert!(string::length(&city) <= MAX_CITY_LEN, E_INVALID_METADATA);
        assert!(string::length(&country) <= MAX_COUNTRY_LEN, E_INVALID_METADATA);
        assert!(string::length(&blob_id) <= MAX_BLOB_ID_LEN, E_INVALID_METADATA);
        assert!(string::length(&image_url) <= MAX_URL_LEN, E_INVALID_METADATA);

        let sender = tx_context::sender(ctx);
        
        // CRITICAL: Only drop creator can mint
        assert!(sender == creator_wallet, E_NOT_OWNER);
        
        let now = tx_context::epoch(ctx);

        // Calculate hype multiplier (higher hype = higher price)
        let hype_multiplier = calculate_hype_multiplier(hype_score);
        let current_price = (base_price * hype_multiplier) / 1000;

        // Create NFT
        let nft = CultureDropNFT {
            id: object::new(ctx),
            title,
            caption,
            city,
            country,
            blob_id,
            image_url,
            drop_id,
            longitude,
            latitude,
            hype_score,
            vote_count,
            comment_count,
            evolution_level: 0,  // Start at Bronze
            creator: sender,
            minted_at: now,
            owner: sender,
            base_price,
            current_price,
            for_sale: if (base_price > 0) { true } else { false },
            hype_multiplier,
        };

        // Emit event
        event::emit(DropNFTMinted {
            nft_id: object::id(&nft),
            drop_id,
            title: nft.title,
            blob_id: nft.blob_id,
            creator: sender,
            owner: sender,
            hype_score,
        });

        // Transfer to minter
        transfer::transfer(nft, sender);
    }

    /// Evolve NFT to next level based on hype score
    /// Can be called by owner when hype threshold is reached
    public entry fun evolve(
        nft: &mut CultureDropNFT,
        new_hype_score: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(nft.owner == sender, E_NOT_OWNER);

        let old_level = nft.evolution_level;
        let new_level = calculate_evolution_level(new_hype_score);

        assert!(new_level > old_level, E_ALREADY_EVOLVED);

        nft.evolution_level = new_level;
        nft.hype_score = new_hype_score;

        event::emit(NFTEvolved {
            nft_id: object::id(nft),
            old_level,
            new_level,
            hype_score: new_hype_score,
        });
    }

    /// List NFT for sale or update price
    public entry fun list_for_sale(
        nft: &mut CultureDropNFT,
        base_price: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(nft.owner == sender, E_NOT_OWNER);

        nft.base_price = base_price;
        nft.hype_multiplier = calculate_hype_multiplier(nft.hype_score);
        nft.current_price = (base_price * nft.hype_multiplier) / 1000;
        nft.for_sale = true;

        event::emit(NFTListed {
            nft_id: object::id(nft),
            seller: sender,
            base_price,
            current_price: nft.current_price,
            hype_multiplier: nft.hype_multiplier,
        });
    }

    /// Delist NFT from sale
    public entry fun delist(
        nft: &mut CultureDropNFT,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(nft.owner == sender, E_NOT_OWNER);

        nft.for_sale = false;
        nft.base_price = 0;
        nft.current_price = 0;

        event::emit(NFTDelisted {
            nft_id: object::id(nft),
            owner: sender,
        });
    }

    /// Buy an NFT (price adjusts based on current hype)
    public entry fun buy_nft(
        mut nft: CultureDropNFT,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(nft.for_sale, E_NOT_FOR_SALE);
        
        let buyer = tx_context::sender(ctx);
        let seller = nft.owner;
        
        // Recalculate price based on current hype
        nft.hype_multiplier = calculate_hype_multiplier(nft.hype_score);
        nft.current_price = (nft.base_price * nft.hype_multiplier) / 1000;
        
        let price = nft.current_price;
        assert!(coin::value(&payment) >= price, E_INSUFFICIENT_PAYMENT);

        // Platform fee: 2.5%
        let fee = (price * 25) / 1000;
        let creator_royalty = (price * 50) / 1000; // 5% to original creator
        
        // Split payment
        if (fee > 0) {
            let fee_coin = coin::split(&mut payment, fee, ctx);
            // Send fee to creator for now (could be platform wallet)
            transfer::public_transfer(fee_coin, nft.creator);
        };
        
        if (creator_royalty > 0 && seller != nft.creator) {
            let royalty_coin = coin::split(&mut payment, creator_royalty, ctx);
            transfer::public_transfer(royalty_coin, nft.creator);
        };
        
        // Rest to seller
        transfer::public_transfer(payment, seller);

        // Emit purchase event
        event::emit(NFTPurchased {
            nft_id: object::id(&nft),
            seller,
            buyer,
            price,
            hype_score: nft.hype_score,
        });

        // Update NFT ownership and delist
        nft.owner = buyer;
        nft.for_sale = false;
        nft.base_price = 0;
        nft.current_price = 0;
        
        // Transfer to buyer
        transfer::transfer(nft, buyer);
    }

    /// Transfer NFT to another address (direct transfer, not sale)
    public entry fun transfer_nft(
        nft: CultureDropNFT,
        recipient: address,
        _ctx: &mut TxContext
    ) {
        transfer::transfer(nft, recipient);
    }

    // -------------------------------------------------------------------------
    // Helper Functions
    // -------------------------------------------------------------------------

    /// Calculate evolution level based on hype score
    fun calculate_evolution_level(hype_score: u64): u8 {
        if (hype_score >= DIAMOND_THRESHOLD) {
            4  // Diamond
        } else if (hype_score >= PLATINUM_THRESHOLD) {
            3  // Platinum
        } else if (hype_score >= GOLD_THRESHOLD) {
            2  // Gold
        } else if (hype_score >= SILVER_THRESHOLD) {
            1  // Silver
        } else {
            0  // Bronze
        }
    }

    /// Calculate price multiplier based on hype score
    /// Returns multiplier in basis points (1000 = 1.0x)
    /// Formula: base_multiplier + (hype_score / 10) * 100
    /// Example: hype=0 → 1.0x, hype=10 → 1.1x, hype=50 → 1.5x, hype=100 → 2.0x
    fun calculate_hype_multiplier(hype_score: u64): u64 {
        // Base multiplier: 1.0x (1000 basis points)
        let base = 1000;
        
        // Add 10% per 10 hype points
        let bonus = (hype_score / 10) * 100;
        
        // Cap at 5.0x (5000 basis points) for hype >= 400
        let total = base + bonus;
        if (total > 5000) {
            5000
        } else {
            total
        }
    }

    // -------------------------------------------------------------------------
    // Getter Functions (for reading NFT data)
    // -------------------------------------------------------------------------

    public fun get_title(nft: &CultureDropNFT): String {
        nft.title
    }

    public fun get_blob_id(nft: &CultureDropNFT): String {
        nft.blob_id
    }

    public fun get_image_url(nft: &CultureDropNFT): String {
        nft.image_url
    }

    public fun get_location(nft: &CultureDropNFT): (String, String) {
        (nft.city, nft.country)
    }

    public fun get_hype_score(nft: &CultureDropNFT): u64 {
        nft.hype_score
    }

    public fun get_evolution_level(nft: &CultureDropNFT): u8 {
        nft.evolution_level
    }

    public fun get_drop_id(nft: &CultureDropNFT): String {
        nft.drop_id
    }

    public fun get_base_price(nft: &CultureDropNFT): u64 {
        nft.base_price
    }

    public fun get_current_price(nft: &CultureDropNFT): u64 {
        nft.current_price
    }

    public fun is_for_sale(nft: &CultureDropNFT): bool {
        nft.for_sale
    }

    public fun get_creator(nft: &CultureDropNFT): address {
        nft.creator
    }
}

