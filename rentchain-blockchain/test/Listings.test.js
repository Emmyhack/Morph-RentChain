const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Listings", function () {
    let Listings;
    let listings;
    let owner, user1, user2, other;
    const propertyId = 1;
    const rentAmount = ethers.parseUnits("1000", 6);
    const ipfsHash = "QmTestHash";
    const title = "Test Property";
    const propertyType = 0; // House

    beforeEach(async function () {
        [owner, user1, user2, other] = await ethers.getSigners();
        Listings = await ethers.getContractFactory("Listings");
        listings = await Listings.deploy();
        await listings.waitForDeployment();
        // Verify landlord before adding property
        await listings.verifyLandlord(user1.address, "mockKYC");
        await listings.verifyLandlord(user2.address, "mockKYC");
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await listings.owner()).to.equal(owner.address);
        });
    });

    describe("Property creation", function () {
        it("Should allow user to create a property", async function () {
            await expect(
                listings.connect(user1).addProperty(title, propertyType, rentAmount, ipfsHash)
            ).to.emit(listings, "PropertyListed");
            const ids = await listings.getLandlordProperties(user1.address);
            expect(ids.length).to.equal(1);
            const property = await listings.getProperty(ids[0]);
            // property is a tuple: [id, landlord, title, propertyType, rentAmount, isAvailable, ipfsHash, createdAt, updatedAt]
            expect(property[1]).to.equal(user1.address); // landlord
            expect(property[2]).to.equal(title);
            expect(property[4]).to.equal(rentAmount);
        });
        it("Should revert if rent amount is zero", async function () {
            await expect(
                listings.connect(user1).addProperty(title, propertyType, 0, ipfsHash)
            ).to.be.revertedWith("Rent amount must be greater than 0");
        });
        it("Should revert if IPFS hash is empty", async function () {
            await expect(
                listings.connect(user1).addProperty(title, propertyType, rentAmount, "")
            ).to.be.revertedWith("IPFS hash cannot be empty");
        });
    });

    describe("Property update", function () {
        let id;
        beforeEach(async function () {
            await listings.connect(user1).addProperty(title, propertyType, rentAmount, ipfsHash);
            [id] = await listings.getLandlordProperties(user1.address);
        });
        it("Should allow owner to update property", async function () {
            await expect(
                listings.connect(user1).updateProperty(id, "New Title", 1, rentAmount * 2n, "QmNewHash")
            ).to.emit(listings, "PropertyUpdated");
            const property = await listings.getProperty(id);
            expect(property.title).to.equal("New Title");
            expect(property.propertyType).to.equal(1);
            expect(property.rentAmount).to.equal(rentAmount * 2n);
        });
        it("Should revert if not property owner", async function () {
            await expect(
                listings.connect(user2).updateProperty(id, "New Title", 1, rentAmount, ipfsHash)
            ).to.be.revertedWith("Only landlord can edit property");
        });
        it("Should revert if rent amount is zero", async function () {
            await expect(
                listings.connect(user1).updateProperty(id, "New Title", 1, 0, ipfsHash)
            ).to.be.revertedWith("Rent amount must be greater than 0");
        });
        it("Should revert if IPFS hash is empty", async function () {
            await expect(
                listings.connect(user1).updateProperty(id, "New Title", 1, rentAmount, "")
            ).to.be.revertedWith("IPFS hash cannot be empty");
        });
    });

    describe("Property removal", function () {
        let id;
        beforeEach(async function () {
            await listings.connect(user1).addProperty(title, propertyType, rentAmount, ipfsHash);
            [id] = await listings.getLandlordProperties(user1.address);
        });
        it("Should allow owner to remove property", async function () {
            await expect(
                listings.connect(user1).removeProperty(id)
            ).to.emit(listings, "PropertyUpdated"); // Contract emits PropertyUpdated with empty values
            const ids = await listings.getLandlordProperties(user1.address);
            expect(ids.length).to.equal(0);
        });
        it("Should revert if not property owner", async function () {
            await expect(
                listings.connect(user2).removeProperty(id)
            ).to.be.revertedWith("Only landlord can remove property");
        });
    });

    describe("Getters and views", function () {
        it("Should return all properties for a user", async function () {
            await listings.connect(user1).addProperty(title, propertyType, rentAmount, ipfsHash);
            await listings.connect(user1).addProperty("Another", 1, rentAmount, ipfsHash);
            const ids = await listings.getLandlordProperties(user1.address);
            expect(ids.length).to.equal(2);
        });
        it("Should return all properties", async function () {
            await listings.connect(user1).addProperty(title, propertyType, rentAmount, ipfsHash);
            await listings.connect(user2).addProperty("Another", 1, rentAmount, ipfsHash);
            const all = await listings.getAllProperties();
            expect(all.length).to.equal(2);
        });
    });

    describe("Pause/unpause", function () {
        it("Should allow only owner to pause and unpause", async function () {
            await expect(listings.connect(owner).pause()).to.not.be.reverted;
            await expect(listings.connect(owner).unpause()).to.not.be.reverted;
        });
        it("Should block actions when paused", async function () {
            await listings.connect(owner).pause();
            await expect(
                listings.connect(user1).addProperty(title, propertyType, rentAmount, ipfsHash)
            ).to.be.revertedWithCustomError(listings, "EnforcedPause");
        });
    });
}); 