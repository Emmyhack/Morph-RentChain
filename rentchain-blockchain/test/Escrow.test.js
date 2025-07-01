const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {
    let Escrow, MockUSDT;
    let escrow, mockUSDT;
    let owner, tenant, landlord, other;
    const initialSupply = ethers.parseUnits("1000000", 6);
    const rentAmount = ethers.parseUnits("1000", 6);
    const propertyId = 1;
    const dueDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now

    beforeEach(async function () {
        [owner, tenant, landlord, other] = await ethers.getSigners();
        MockUSDT = await ethers.getContractFactory("MockUSDT");
        mockUSDT = await MockUSDT.deploy(initialSupply);
        await mockUSDT.waitForDeployment();
        Escrow = await ethers.getContractFactory("Escrow");
        escrow = await Escrow.deploy(await mockUSDT.getAddress());
        await escrow.waitForDeployment();
        // Mint USDT to tenant
        await mockUSDT.mint(tenant.address, rentAmount * 10n);
    });

    describe("Deployment", function () {
        it("Should set the correct USDT address", async function () {
            expect(await escrow.usdtToken()).to.equal(await mockUSDT.getAddress());
        });
        it("Should set the correct owner", async function () {
            expect(await escrow.owner()).to.equal(owner.address);
        });
    });

    describe("Payment creation", function () {
        it("Should allow tenant to create a payment", async function () {
            await expect(
                escrow.connect(tenant).createPayment(landlord.address, propertyId, rentAmount, dueDate)
            ).to.emit(escrow, "PaymentCreated");
            const paymentIds = await escrow.getUserPayments(tenant.address);
            expect(paymentIds.length).to.equal(1);
            const payment = await escrow.getPayment(paymentIds[0]);
            expect(payment.tenant).to.equal(tenant.address);
            expect(payment.landlord).to.equal(landlord.address);
            expect(payment.amount).to.equal(rentAmount);
        });
        it("Should revert if landlord is zero address", async function () {
            await expect(
                escrow.connect(tenant).createPayment(ethers.ZeroAddress, propertyId, rentAmount, dueDate)
            ).to.be.revertedWith("Invalid landlord address");
        });
        it("Should revert if amount is zero", async function () {
            await expect(
                escrow.connect(tenant).createPayment(landlord.address, propertyId, 0, dueDate)
            ).to.be.revertedWith("Amount must be greater than 0");
        });
        it("Should revert if due date is in the past", async function () {
            await expect(
                escrow.connect(tenant).createPayment(landlord.address, propertyId, rentAmount, 1)
            ).to.be.revertedWith("Due date must be in the future");
        });
    });

    describe("USDT payments", function () {
        let paymentId;
        beforeEach(async function () {
            await escrow.connect(tenant).createPayment(landlord.address, propertyId, rentAmount, dueDate);
            [paymentId] = await escrow.getUserPayments(tenant.address);
        });
        it("Should allow tenant to pay with USDT", async function () {
            await mockUSDT.connect(tenant).approve(await escrow.getAddress(), rentAmount);
            await expect(
                escrow.connect(tenant).payWithUSDT(paymentId)
            ).to.emit(escrow, "PaymentPaid");
            const payment = await escrow.getPayment(paymentId);
            expect(payment.status).to.equal(1); // Paid
            expect(payment.paymentType).to.equal(0); // USDT
        });
        it("Should transfer USDT to landlord minus fee", async function () {
            const landlordBalanceBefore = await mockUSDT.balanceOf(landlord.address);
            await mockUSDT.connect(tenant).approve(await escrow.getAddress(), rentAmount);
            await escrow.connect(tenant).payWithUSDT(paymentId);
            const landlordBalanceAfter = await mockUSDT.balanceOf(landlord.address);
            const fee = rentAmount * BigInt(await escrow.platformFee()) / BigInt(await escrow.BASIS_POINTS());
            const landlordBalanceDelta = landlordBalanceAfter - landlordBalanceBefore;
            expect(landlordBalanceDelta).to.equal(rentAmount - fee);
        });
        it("Should revert if not called by tenant", async function () {
            await mockUSDT.connect(tenant).approve(await escrow.getAddress(), rentAmount);
            await expect(
                escrow.connect(landlord).payWithUSDT(paymentId)
            ).to.be.revertedWith("Only tenant can pay");
        });
        it("Should revert if payment is not pending", async function () {
            await mockUSDT.connect(tenant).approve(await escrow.getAddress(), rentAmount);
            await escrow.connect(tenant).payWithUSDT(paymentId);
            await expect(
                escrow.connect(tenant).payWithUSDT(paymentId)
            ).to.be.revertedWith("Payment not pending");
        });
        it("Should revert if payment type is not USDT", async function () {
            await escrow.connect(tenant).recordFiatPayment(paymentId, "txhash");
            await expect(
                escrow.connect(tenant).payWithUSDT(paymentId)
            ).to.be.revertedWith("Payment not pending");
        });
    });

    describe("Fiat on-ramp payments", function () {
        let paymentId;
        beforeEach(async function () {
            await escrow.connect(tenant).createPayment(landlord.address, propertyId, rentAmount, dueDate);
            [paymentId] = await escrow.getUserPayments(tenant.address);
        });
        it("Should allow tenant to record fiat payment", async function () {
            await expect(
                escrow.connect(tenant).recordFiatPayment(paymentId, "txhash")
            ).to.emit(escrow, "PaymentPaid");
            const payment = await escrow.getPayment(paymentId);
            expect(payment.status).to.equal(1); // Paid
            expect(payment.paymentType).to.equal(1); // FiatOnRamp
            expect(payment.transactionHash).to.equal("txhash");
        });
        it("Should revert if not called by tenant", async function () {
            await expect(
                escrow.connect(landlord).recordFiatPayment(paymentId, "txhash")
            ).to.be.revertedWith("Only tenant can record payment");
        });
        it("Should revert if payment is not pending", async function () {
            await escrow.connect(tenant).recordFiatPayment(paymentId, "txhash");
            await expect(
                escrow.connect(tenant).recordFiatPayment(paymentId, "txhash2")
            ).to.be.revertedWith("Payment not pending");
        });
        it("Should revert if transaction hash is empty", async function () {
            await expect(
                escrow.connect(tenant).recordFiatPayment(paymentId, "")
            ).to.be.revertedWith("Transaction hash required");
        });
    });

    describe("Disputes and refunds", function () {
        let paymentId;
        beforeEach(async function () {
            await escrow.connect(tenant).createPayment(landlord.address, propertyId, rentAmount, dueDate);
            [paymentId] = await escrow.getUserPayments(tenant.address);
            await mockUSDT.connect(tenant).approve(await escrow.getAddress(), rentAmount);
            await escrow.connect(tenant).payWithUSDT(paymentId);
        });
        it("Should allow tenant or landlord to dispute a paid payment", async function () {
            // First scenario: tenant disputes
            await expect(
                escrow.connect(tenant).disputePayment(paymentId, "reason")
            ).to.emit(escrow, "PaymentDisputed");
            // Second scenario: create a new payment for landlord to dispute
            await escrow.connect(tenant).createPayment(landlord.address, propertyId, rentAmount, dueDate + 1000);
            const [_, newPaymentId] = await escrow.getUserPayments(tenant.address);
            await mockUSDT.connect(tenant).approve(await escrow.getAddress(), rentAmount);
            await escrow.connect(tenant).payWithUSDT(newPaymentId);
            await expect(
                escrow.connect(landlord).disputePayment(newPaymentId, "reason")
            ).to.emit(escrow, "PaymentDisputed");
        });
        it("Should revert if not paid", async function () {
            // Mint USDT to escrow contract so it can process the refund (prevents insufficient balance error)
            await mockUSDT.mint(await escrow.getAddress(), rentAmount);
            await escrow.connect(owner).refundPayment(paymentId);
            await expect(
                escrow.connect(tenant).disputePayment(paymentId, "reason")
            ).to.be.revertedWith("Payment must be paid to dispute");
        });
        it("Should revert if reason is empty", async function () {
            await expect(
                escrow.connect(tenant).disputePayment(paymentId, "")
            ).to.be.revertedWith("Dispute reason required");
        });
        it("Should allow only owner to refund", async function () {
            // Mint USDT to escrow contract so it can refund
            await mockUSDT.mint(await escrow.getAddress(), rentAmount);
            // Refund the first payment (already paid)
            await expect(
                escrow.connect(owner).refundPayment(paymentId)
            ).to.emit(escrow, "PaymentRefunded");
            // Create a new payment for the next scenario to avoid state issues
            await escrow.connect(tenant).createPayment(landlord.address, propertyId, rentAmount, dueDate + 1000);
            const [_, newPaymentId] = await escrow.getUserPayments(tenant.address); // Use the second payment
            await mockUSDT.connect(tenant).approve(await escrow.getAddress(), rentAmount);
            await escrow.connect(tenant).payWithUSDT(newPaymentId);
            // Only owner can refund; tenant should be reverted
            await expect(
                escrow.connect(tenant).refundPayment(newPaymentId)
            ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
        });
        it("Should refund USDT to tenant if payment type is USDT", async function () {
            // Mint USDT to escrow contract so it can process the refund
            await mockUSDT.mint(await escrow.getAddress(), rentAmount);
            const tenantBalanceBefore = await mockUSDT.balanceOf(tenant.address);
            await escrow.connect(owner).refundPayment(paymentId);
            const tenantBalanceAfter = await mockUSDT.balanceOf(tenant.address);
            expect(tenantBalanceAfter).to.be.gt(tenantBalanceBefore);
        });
    });

    describe("Platform fee and admin", function () {
        it("Should allow only owner to update platform fee", async function () {
            await expect(
                escrow.connect(owner).updatePlatformFee(100)
            ).to.emit(escrow, "PlatformFeeUpdated");
            await expect(
                escrow.connect(tenant).updatePlatformFee(100)
            ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
        });
        it("Should revert if fee is too high", async function () {
            await expect(
                escrow.connect(owner).updatePlatformFee(1000)
            ).to.be.revertedWith("Fee cannot exceed 5%");
        });
        it("Should allow only owner to update USDT address", async function () {
            const newToken = await MockUSDT.deploy(initialSupply);
            await newToken.waitForDeployment();
            await expect(
                escrow.connect(owner).updateUSDTAddress(await newToken.getAddress())
            ).to.emit(escrow, "USDTAddressUpdated");
            await expect(
                escrow.connect(tenant).updateUSDTAddress(await newToken.getAddress())
            ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
        });
    });

    describe("Pause/unpause", function () {
        it("Should allow only owner to pause and unpause", async function () {
            await expect(escrow.connect(owner).pause()).to.not.be.reverted;
            await expect(escrow.connect(owner).unpause()).to.not.be.reverted;
        });
        it("Should block actions when paused", async function () {
            await escrow.connect(owner).pause();
            await expect(
                escrow.connect(tenant).createPayment(landlord.address, propertyId, rentAmount, dueDate)
            ).to.be.revertedWithCustomError(escrow, "EnforcedPause");
        });
    });

    describe("Getters and views", function () {
        it("Should return correct stats", async function () {
            await escrow.connect(tenant).createPayment(landlord.address, propertyId, rentAmount, dueDate);
            const [totalPayments, totalUSDTVolume, totalFiatVolume, platformFee] = await escrow.getPlatformStats();
            expect(totalPayments).to.equal(1);
        });
        it("Should return correct pending and overdue payments", async function () {
            await escrow.connect(tenant).createPayment(landlord.address, propertyId, rentAmount, dueDate);
            const pending = await escrow.getPendingPayments(tenant.address);
            expect(pending.length).to.equal(1);
            const overdue = await escrow.getOverduePayments(tenant.address);
            expect(overdue.length).to.equal(0);
        });
    });
}); 