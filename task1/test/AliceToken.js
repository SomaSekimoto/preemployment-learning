const { expect } = require("chai");

describe("Alice Token contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();

    const AliceFactory = await ethers.getContractFactory("AliceToken");

    const AliceToken = await AliceFactory.deploy();

    const ownerBalance = await AliceToken.balanceOf(owner.address);
    expect(await AliceToken.totalSupply()).to.equal(ownerBalance);
  });
  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();

      const AliceFactory = await ethers.getContractFactory("AliceToken");

      const AliceToken = await AliceFactory.deploy();

      // Transfer 50 tokens from owner to addr1
      await AliceToken.transfer(addr1.address, 50);
      expect(await AliceToken.balanceOf(addr1.address)).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await AliceToken.connect(addr1).transfer(addr2.address, 50);
      expect(await AliceToken.balanceOf(addr2.address)).to.equal(50);
    });
  });
});
