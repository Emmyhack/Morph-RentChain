const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Complaints", function () {
    let Complaints;
    let complaints;
    let owner, tenant, landlord, other;
    const propertyId = 1;
    const ipfsHash = "QmTestHash";

    beforeEach(async function () {
        [owner, tenant, landlord, other] = await ethers.getSigners();
        Complaints = await ethers.getContractFactory("Complaints");
        complaints = await Complaints.deploy();
        await complaints.waitForDeployment();
        // Set landlord for property
        await complaints.connect(owner).setPropertyLandlord(propertyId, landlord.address);
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await complaints.owner()).to.equal(owner.address);
        });
    });

    describe("Logging complaints", function () {
        it("Should allow tenant to log a complaint", async function () {
            await expect(
                complaints.connect(tenant).logComplaint(propertyId, ipfsHash)
            ).to.emit(complaints, "ComplaintLogged");
            const ids = await complaints.getTenantComplaints(tenant.address);
            expect(ids.length).to.equal(1);
            const complaint = await complaints.getComplaint(ids[0]);
            expect(complaint.tenant).to.equal(tenant.address);
            expect(complaint.propertyId).to.equal(propertyId);
            expect(complaint.ipfsHash).to.equal(ipfsHash);
            expect(complaint.status).to.equal(0); // Open
        });
        it("Should revert if landlord tries to log a complaint", async function () {
            await expect(
                complaints.connect(landlord).logComplaint(propertyId, ipfsHash)
            ).to.be.revertedWith("Landlord cannot log complaints");
        });
        it("Should revert if property does not exist", async function () {
            await expect(
                complaints.connect(tenant).logComplaint(999, ipfsHash)
            ).to.be.revertedWith("Property not found");
        });
        it("Should revert if IPFS hash is empty", async function () {
            await expect(
                complaints.connect(tenant).logComplaint(propertyId, "")
            ).to.be.revertedWith("IPFS hash cannot be empty");
        });
    });

    describe("Resolving complaints", function () {
        let complaintId;
        beforeEach(async function () {
            await complaints.connect(tenant).logComplaint(propertyId, ipfsHash);
            [complaintId] = await complaints.getPropertyComplaints(propertyId);
        });
        it("Should allow landlord to resolve a complaint", async function () {
            await expect(
                complaints.connect(landlord).resolveComplaint(complaintId)
            ).to.emit(complaints, "ComplaintResolved");
            const complaint = await complaints.getComplaint(complaintId);
            expect(complaint.status).to.equal(1); // Resolved
            expect(complaint.resolvedBy).to.equal(landlord.address);
        });
        it("Should revert if non-landlord tries to resolve", async function () {
            await expect(
                complaints.connect(tenant).resolveComplaint(complaintId)
            ).to.be.revertedWith("Only landlord can resolve complaint");
        });
        it("Should revert if complaint already resolved", async function () {
            await complaints.connect(landlord).resolveComplaint(complaintId);
            await expect(
                complaints.connect(landlord).resolveComplaint(complaintId)
            ).to.be.revertedWith("Complaint already resolved");
        });
    });

    describe("Getters", function () {
        beforeEach(async function () {
            await complaints.connect(tenant).logComplaint(propertyId, ipfsHash);
        });
        it("Should return all complaints for a property", async function () {
            const ids = await complaints.getPropertyComplaints(propertyId);
            expect(ids.length).to.equal(1);
        });
        it("Should return all complaints for a tenant", async function () {
            const ids = await complaints.getTenantComplaints(tenant.address);
            expect(ids.length).to.equal(1);
        });
        it("Should return open complaints for a property", async function () {
            const ids = await complaints.getOpenPropertyComplaints(propertyId);
            expect(ids.length).to.equal(1);
        });
        it("Should return total complaints and open complaints", async function () {
            expect(await complaints.getTotalComplaints()).to.equal(1);
            expect(await complaints.getTotalOpenComplaints()).to.equal(1);
        });
        it("Should return landlord for a property", async function () {
            expect(await complaints.getPropertyLandlord(propertyId)).to.equal(landlord.address);
        });
        it("Should check if complaint is open", async function () {
            const ids = await complaints.getPropertyComplaints(propertyId);
            expect(await complaints.isComplaintOpen(ids[0])).to.equal(true);
        });
    });

    describe("Pause/unpause", function () {
        it("Should allow only owner to pause and unpause", async function () {
            await expect(complaints.connect(owner).pause()).to.not.be.reverted;
            await expect(complaints.connect(owner).unpause()).to.not.be.reverted;
        });
        it("Should block actions when paused", async function () {
            await complaints.connect(owner).pause();
            await expect(
                complaints.connect(tenant).logComplaint(propertyId, ipfsHash)
            ).to.be.revertedWithCustomError(complaints, "EnforcedPause");
        });
    });
}); 