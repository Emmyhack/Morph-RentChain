const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockUSDT", function () {
    let MockUSDT;
    let mockUSDT;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    const INITIAL_SUPPLY = 1000000n * 10n**6n; // 1 million USDT
    const MAX_SUPPLY = 1000000000n * 10n**6n; // 1 billion USDT

    beforeEach(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        
        MockUSDT = await ethers.getContractFactory("MockUSDT");
        mockUSDT = await MockUSDT.deploy(INITIAL_SUPPLY);
        await mockUSDT.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await mockUSDT.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await mockUSDT.balanceOf(owner.address);
            expect(await mockUSDT.totalSupply()).to.equal(ownerBalance);
        });

        it("Should have correct decimals", async function () {
            expect(await mockUSDT.decimals()).to.equal(6);
        });

        it("Should have correct name and symbol", async function () {
            expect(await mockUSDT.name()).to.equal("Mock USDT");
            expect(await mockUSDT.symbol()).to.equal("mUSDT");
        });

        it("Should have correct max supply", async function () {
            expect(await mockUSDT.maxSupply()).to.equal(MAX_SUPPLY);
        });
    });

    describe("Minting", function () {
        it("Should allow owner to mint tokens", async function () {
            const mintAmount = 1000n * 10n**6n; // 1000 USDT
            const initialBalance = await mockUSDT.balanceOf(addr1.address);
            
            await mockUSDT.mint(addr1.address, mintAmount);
            
            const finalBalance = await mockUSDT.balanceOf(addr1.address);
            expect(finalBalance).to.equal(initialBalance + mintAmount);
        });

        it("Should emit Minted event", async function () {
            const mintAmount = 1000n * 10n**6n;
            
            await expect(mockUSDT.mint(addr1.address, mintAmount))
                .to.emit(mockUSDT, "Minted")
                .withArgs(addr1.address, mintAmount);
        });

        it("Should not allow non-owner to mint", async function () {
            const mintAmount = 1000n * 10n**6n;
            
            await expect(
                mockUSDT.connect(addr1).mint(addr2.address, mintAmount)
            ).to.be.revertedWithCustomError(mockUSDT, "OwnableUnauthorizedAccount");
        });

        it("Should not allow minting to zero address", async function () {
            const mintAmount = 1000n * 10n**6n;
            
            await expect(
                mockUSDT.mint(ethers.ZeroAddress, mintAmount)
            ).to.be.revertedWith("Cannot mint to zero address");
        });

        it("Should not allow minting zero amount", async function () {
            await expect(
                mockUSDT.mint(addr1.address, 0n)
            ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("Should not allow minting beyond max supply", async function () {
            const remainingSupply = await mockUSDT.remainingMintableSupply();
            const exceedAmount = remainingSupply + 1n;
            
            await expect(
                mockUSDT.mint(addr1.address, exceedAmount)
            ).to.be.revertedWith("Would exceed max supply");
        });
    });

    describe("Burning", function () {
        beforeEach(async function () {
            // Mint some tokens to addr1 for testing
            await mockUSDT.mint(addr1.address, 10000n * 10n**6n);
        });

        it("Should allow users to burn their own tokens", async function () {
            const burnAmount = 1000n * 10n**6n;
            const initialBalance = await mockUSDT.balanceOf(addr1.address);
            
            await mockUSDT.connect(addr1).burn(burnAmount);
            
            const finalBalance = await mockUSDT.balanceOf(addr1.address);
            expect(finalBalance).to.equal(initialBalance - burnAmount);
        });

        it("Should emit Burned event when user burns", async function () {
            const burnAmount = 1000n * 10n**6n;
            
            await expect(mockUSDT.connect(addr1).burn(burnAmount))
                .to.emit(mockUSDT, "Burned")
                .withArgs(addr1.address, burnAmount);
        });

        it("Should allow owner to burn from any address", async function () {
            const burnAmount = 1000n * 10n**6n;
            const initialBalance = await mockUSDT.balanceOf(addr1.address);
            
            await mockUSDT.burnFrom(addr1.address, burnAmount);
            
            const finalBalance = await mockUSDT.balanceOf(addr1.address);
            expect(finalBalance).to.equal(initialBalance - burnAmount);
        });

        it("Should emit Burned event when owner burns from address", async function () {
            const burnAmount = 1000n * 10n**6n;
            
            await expect(mockUSDT.burnFrom(addr1.address, burnAmount))
                .to.emit(mockUSDT, "Burned")
                .withArgs(addr1.address, burnAmount);
        });

        it("Should not allow non-owner to burn from other address", async function () {
            const burnAmount = 1000n * 10n**6n;
            
            await expect(
                mockUSDT.connect(addr2).burnFrom(addr1.address, burnAmount)
            ).to.be.revertedWithCustomError(mockUSDT, "OwnableUnauthorizedAccount");
        });

        it("Should not allow burning more than balance", async function () {
            const balance = await mockUSDT.balanceOf(addr1.address);
            const burnAmount = balance + 1n;
            
            await expect(
                mockUSDT.connect(addr1).burn(burnAmount)
            ).to.be.revertedWith("Insufficient balance");
        });

        it("Should not allow burning zero amount", async function () {
            await expect(
                mockUSDT.connect(addr1).burn(0n)
            ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("Should not allow burning from zero address", async function () {
            const burnAmount = 1000n * 10n**6n;
            
            await expect(
                mockUSDT.burnFrom(ethers.ZeroAddress, burnAmount)
            ).to.be.revertedWith("Cannot burn from zero address");
        });
    });

    describe("Transfers", function () {
        beforeEach(async function () {
            // Mint some tokens to addr1 for testing
            await mockUSDT.mint(addr1.address, 10000n * 10n**6n);
        });

        it("Should transfer tokens between accounts", async function () {
            const transferAmount = 1000n * 10n**6n;
            const initialBalance1 = await mockUSDT.balanceOf(addr1.address);
            const initialBalance2 = await mockUSDT.balanceOf(addr2.address);
            
            await mockUSDT.connect(addr1).transfer(addr2.address, transferAmount);
            
            const finalBalance1 = await mockUSDT.balanceOf(addr1.address);
            const finalBalance2 = await mockUSDT.balanceOf(addr2.address);
            
            expect(finalBalance1).to.equal(initialBalance1 - transferAmount);
            expect(finalBalance2).to.equal(initialBalance2 + transferAmount);
        });

        it("Should fail if sender doesn't have enough tokens", async function () {
            const initialBalance = await mockUSDT.balanceOf(addr1.address);
            const transferAmount = initialBalance + 1n;
            await expect(
                mockUSDT.connect(addr1).transfer(addr2.address, transferAmount)
            ).to.be.revertedWithCustomError(mockUSDT, "ERC20InsufficientBalance");
        });
    });

    describe("Utility functions", function () {
        it("Should return correct remaining mintable supply", async function () {
            const initialRemaining = await mockUSDT.remainingMintableSupply();
            expect(initialRemaining).to.equal(MAX_SUPPLY - INITIAL_SUPPLY);
            
            // Mint some tokens
            await mockUSDT.mint(addr1.address, 1000n * 10n**6n);
            
            const finalRemaining = await mockUSDT.remainingMintableSupply();
            expect(finalRemaining).to.equal(MAX_SUPPLY - INITIAL_SUPPLY - 1000n * 10n**6n);
        });

        it("Should convert USDT to wei correctly", async function () {
            const usdtAmount = 1000n * 10n**6n; // 1000 USDT
            const weiAmount = await mockUSDT.toWei(usdtAmount);
            expect(weiAmount).to.equal(usdtAmount * 10n**12n);
        });

        it("Should convert wei to USDT correctly", async function () {
            const weiAmount = 1000n * 10n**18n; // 1000 wei
            const usdtAmount = await mockUSDT.fromWei(weiAmount);
            expect(usdtAmount).to.equal(1000n * 10n**6n); // 1000 USDT
        });
    });

    describe("Edge cases", function () {
        it("Should handle very small amounts", async function () {
            const smallAmount = 1n; // 1 wei in USDT terms
            await mockUSDT.mint(addr1.address, smallAmount);
            expect(await mockUSDT.balanceOf(addr1.address)).to.equal(smallAmount);
        });

        it("Should handle maximum amounts", async function () {
            const maxMintable = await mockUSDT.remainingMintableSupply();
            await mockUSDT.mint(addr1.address, maxMintable);
            expect(await mockUSDT.remainingMintableSupply()).to.equal(0n);
        });
    });
}); 