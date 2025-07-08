const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Listings Lease Agreement", function () {
  let Listings, listings, owner, landlord, tenant;

  beforeEach(async function () {
    [owner, landlord, tenant] = await ethers.getSigners();
    Listings = await ethers.getContractFactory("Listings");
    listings = await Listings.deploy();
    // Verify landlord for testing
    await listings.connect(owner).verifyLandlord(landlord.address, "kycHash");
  });

  it("should add a property with a lease agreement IPFS hash", async function () {
    const leaseHash = "QmLeaseAgreementHash";
    await listings.connect(landlord).addProperty(
      "Test Property",
      0, // House
      ethers.parseUnits("1000", 6),
      "QmPropertyImageHash",
      leaseHash
    );
    const prop = await listings.getProperty(1);
    expect(prop.leaseAgreementIpfsHash).to.equal(leaseHash);
  });

  it("should edit a property and update the lease agreement IPFS hash", async function () {
    await listings.connect(landlord).addProperty(
      "Test Property",
      0,
      ethers.parseUnits("1000", 6),
      "QmPropertyImageHash",
      "QmLeaseAgreementHash1"
    );
    await listings.connect(landlord).editProperty(
      1,
      "Test Property Updated",
      0,
      ethers.parseUnits("1200", 6),
      "QmPropertyImageHash2",
      "QmLeaseAgreementHash2"
    );
    const prop = await listings.getProperty(1);
    expect(prop.leaseAgreementIpfsHash).to.equal("QmLeaseAgreementHash2");
  });

  it("should revert if lease agreement hash is empty", async function () {
    await expect(
      listings.connect(landlord).addProperty(
        "Test Property",
        0,
        ethers.parseUnits("1000", 6),
        "QmPropertyImageHash",
        ""
      )
    ).to.be.revertedWith("Lease agreement IPFS hash cannot be empty");
  });
}); 