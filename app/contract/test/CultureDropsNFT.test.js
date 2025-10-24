const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CultureDropsNFT", function () {
    let cultureDropsNFT;
    let owner;
    let creator;
    let buyer;
    let platformFeeRecipient;

    const name = "Culture Drops";
    const symbol = "CULTURE";
    const baseTokenURI = "https://api.culturedrops.app/metadata/";

    beforeEach(async function () {
        [owner, creator, buyer, platformFeeRecipient] = await ethers.getSigners();

        const CultureDropsNFT = await ethers.getContractFactory("CultureDropsNFT");
        cultureDropsNFT = await CultureDropsNFT.deploy(
            name,
            symbol,
            baseTokenURI,
            platformFeeRecipient.address
        );
        await cultureDropsNFT.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct name and symbol", async function () {
            expect(await cultureDropsNFT.name()).to.equal(name);
            expect(await cultureDropsNFT.symbol()).to.equal(symbol);
        });

        it("Should set the correct owner", async function () {
            expect(await cultureDropsNFT.owner()).to.equal(owner.address);
        });

        it("Should set the correct platform fee recipient", async function () {
            expect(await cultureDropsNFT.platformFeeRecipient()).to.equal(platformFeeRecipient.address);
        });

        it("Should have zero initial supply", async function () {
            expect(await cultureDropsNFT.totalSupply()).to.equal(0);
        });
    });

    describe("Minting", function () {
        const dropData = {
            title: "Amazing Culture Drop",
            caption: "This is an amazing culture drop with great content",
            city: "New York",
            country: "USA",
            blobId: "blob_12345",
            imageUrl: "https://example.com/image.jpg",
            dropId: "drop_67890",
            longitude: "-74.0060",
            latitude: "40.7128",
            hypeScore: 25,
            voteCount: 10,
            commentCount: 5,
            basePrice: ethers.parseEther("0.1") // 0.1 ETH
        };

        it("Should mint NFT successfully", async function () {
            await expect(
                cultureDropsNFT.connect(creator).mintDrop(
                    dropData.title,
                    dropData.caption,
                    dropData.city,
                    dropData.country,
                    dropData.blobId,
                    dropData.imageUrl,
                    dropData.dropId,
                    dropData.longitude,
                    dropData.latitude,
                    dropData.hypeScore,
                    dropData.voteCount,
                    dropData.commentCount,
                    dropData.basePrice,
                    creator.address
                )
            ).to.emit(cultureDropsNFT, "DropNFTMinted");

            expect(await cultureDropsNFT.totalSupply()).to.equal(1);
            expect(await cultureDropsNFT.ownerOf(0)).to.equal(creator.address);
        });

        it("Should reject minting from unauthorized address", async function () {
            await expect(
                cultureDropsNFT.connect(buyer).mintDrop(
                    dropData.title,
                    dropData.caption,
                    dropData.city,
                    dropData.country,
                    dropData.blobId,
                    dropData.imageUrl,
                    dropData.dropId,
                    dropData.longitude,
                    dropData.latitude,
                    dropData.hypeScore,
                    dropData.voteCount,
                    dropData.commentCount,
                    dropData.basePrice,
                    creator.address // Different from msg.sender (buyer)
                )
            ).to.be.revertedWith("Not authorized to mint");
        });

        it("Should reject strings that are too long", async function () {
            const longTitle = "a".repeat(101); // Exceeds MAX_TITLE_LEN

            await expect(
                cultureDropsNFT.connect(creator).mintDrop(
                    longTitle,
                    dropData.caption,
                    dropData.city,
                    dropData.country,
                    dropData.blobId,
                    dropData.imageUrl,
                    dropData.dropId,
                    dropData.longitude,
                    dropData.latitude,
                    dropData.hypeScore,
                    dropData.voteCount,
                    dropData.commentCount,
                    dropData.basePrice,
                    creator.address
                )
            ).to.be.revertedWith("String too long");
        });
    });

    describe("Evolution", function () {
        beforeEach(async function () {
            // Mint an NFT first
            await cultureDropsNFT.connect(creator).mintDrop(
                "Test Drop",
                "Test Caption",
                "Test City",
                "Test Country",
                "blob_123",
                "https://example.com/image.jpg",
                "drop_123",
                "-74.0060",
                "40.7128",
                5, // Low hype score (Bronze level)
                2,
                1,
                ethers.parseEther("0.1"),
                creator.address
            );
        });

        it("Should evolve NFT to next level", async function () {
            const newHypeScore = 15; // Should be Silver level

            await expect(
                cultureDropsNFT.connect(creator).evolve(0, newHypeScore)
            ).to.emit(cultureDropsNFT, "NFTEvolved");

            const dropData = await cultureDropsNFT.getCultureDropData(0);
            expect(dropData.evolutionLevel).to.equal(1); // Silver
            expect(dropData.hypeScore).to.equal(newHypeScore);
        });

        it("Should reject evolution to same or lower level", async function () {
            await expect(
                cultureDropsNFT.connect(creator).evolve(0, 3) // Still Bronze level
            ).to.be.revertedWith("Already at max evolution");
        });

        it("Should reject evolution from non-owner", async function () {
            await expect(
                cultureDropsNFT.connect(buyer).evolve(0, 15)
            ).to.be.revertedWith("Not NFT owner");
        });
    });

    describe("Marketplace", function () {
        beforeEach(async function () {
            // Mint an NFT first
            await cultureDropsNFT.connect(creator).mintDrop(
                "Test Drop",
                "Test Caption",
                "Test City",
                "Test Country",
                "blob_123",
                "https://example.com/image.jpg",
                "drop_123",
                "-74.0060",
                "40.7128",
                25, // Hype score for testing
                10,
                5,
                ethers.parseEther("0.1"),
                creator.address
            );
        });

        it("Should list NFT for sale", async function () {
            const newPrice = ethers.parseEther("0.2");

            await expect(
                cultureDropsNFT.connect(creator).listForSale(0, newPrice)
            ).to.emit(cultureDropsNFT, "NFTListed");

            const dropData = await cultureDropsNFT.getCultureDropData(0);
            expect(dropData.forSale).to.be.true;
            expect(dropData.basePrice).to.equal(newPrice);
        });

        it("Should delist NFT from sale", async function () {
            // First list it
            await cultureDropsNFT.connect(creator).listForSale(0, ethers.parseEther("0.2"));

            // Then delist it
            await expect(
                cultureDropsNFT.connect(creator).delist(0)
            ).to.emit(cultureDropsNFT, "NFTDelisted");

            const dropData = await cultureDropsNFT.getCultureDropData(0);
            expect(dropData.forSale).to.be.false;
            expect(dropData.basePrice).to.equal(0);
        });

        it("Should allow buying NFT", async function () {
            const listPrice = ethers.parseEther("0.1");
            await cultureDropsNFT.connect(creator).listForSale(0, listPrice);

            const dropData = await cultureDropsNFT.getCultureDropData(0);
            const expectedPrice = dropData.currentPrice;

            await expect(
                cultureDropsNFT.connect(buyer).buyNFT(0, { value: expectedPrice })
            ).to.emit(cultureDropsNFT, "NFTPurchased");

            expect(await cultureDropsNFT.ownerOf(0)).to.equal(buyer.address);
        });

        it("Should reject buying with insufficient payment", async function () {
            await cultureDropsNFT.connect(creator).listForSale(0, ethers.parseEther("0.1"));

            await expect(
                cultureDropsNFT.connect(buyer).buyNFT(0, { value: ethers.parseEther("0.05") })
            ).to.be.revertedWith("Insufficient payment");
        });

        it("Should reject buying own NFT", async function () {
            await cultureDropsNFT.connect(creator).listForSale(0, ethers.parseEther("0.1"));

            await expect(
                cultureDropsNFT.connect(creator).buyNFT(0, { value: ethers.parseEther("0.1") })
            ).to.be.revertedWith("Cannot buy own NFT");
        });
    });

    describe("Helper Functions", function () {
        it("Should calculate evolution level correctly", async function () {
            expect(await cultureDropsNFT.calculateEvolutionLevel(5)).to.equal(0); // Bronze
            expect(await cultureDropsNFT.calculateEvolutionLevel(15)).to.equal(1); // Silver
            expect(await cultureDropsNFT.calculateEvolutionLevel(60)).to.equal(2); // Gold
            expect(await cultureDropsNFT.calculateEvolutionLevel(150)).to.equal(3); // Platinum
            expect(await cultureDropsNFT.calculateEvolutionLevel(600)).to.equal(4); // Diamond
        });

        it("Should calculate hype multiplier correctly", async function () {
            expect(await cultureDropsNFT.calculateHypeMultiplier(0)).to.equal(1000); // 1.0x
            expect(await cultureDropsNFT.calculateHypeMultiplier(10)).to.equal(1100); // 1.1x
            expect(await cultureDropsNFT.calculateHypeMultiplier(50)).to.equal(1500); // 1.5x
            expect(await cultureDropsNFT.calculateHypeMultiplier(100)).to.equal(2000); // 2.0x
            expect(await cultureDropsNFT.calculateHypeMultiplier(500)).to.equal(5000); // 5.0x (capped)
        });
    });

    describe("Admin Functions", function () {
        it("Should update platform fee recipient", async function () {
            await cultureDropsNFT.updatePlatformFeeRecipient(buyer.address);
            expect(await cultureDropsNFT.platformFeeRecipient()).to.equal(buyer.address);
        });

        it("Should reject updating platform fee recipient from non-owner", async function () {
            await expect(
                cultureDropsNFT.connect(creator).updatePlatformFeeRecipient(buyer.address)
            ).to.be.revertedWithCustomError(cultureDropsNFT, "OwnableUnauthorizedAccount");
        });

        it("Should update base URI", async function () {
            const newURI = "https://newapi.culturedrops.app/metadata/";
            await cultureDropsNFT.setBaseURI(newURI);
            // Test by checking if the base URI was set correctly
            // We can't directly access _baseTokenURI, so we'll test through tokenURI
            expect(await cultureDropsNFT.baseURI()).to.equal(newURI);
        });
    });
});
