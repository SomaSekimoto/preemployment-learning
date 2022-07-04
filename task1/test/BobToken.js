const { expect } = require("chai");

describe("Bob Token contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();

    const BobFactory = await ethers.getContractFactory("BobToken");

    const BobToken = await BobFactory.deploy();

    const ownerBalance = await BobToken.balanceOf(owner.address);
    expect(await BobToken.totalSupply()).to.equal(ownerBalance);
  });
  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();

      const BobFactory = await ethers.getContractFactory("BobToken");

      const BobToken = await BobFactory.deploy();

      // Transfer 50 tokens from owner to addr1
      await BobToken.transfer(addr1.address, 50);
      expect(await BobToken.balanceOf(addr1.address)).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await BobToken.connect(addr1).transfer(addr2.address, 50);
      expect(await BobToken.balanceOf(addr2.address)).to.equal(50);
    });
  });
});
