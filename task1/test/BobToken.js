const { expect } = require("chai");

describe("Bob Token contract", function () {
  let AliceFactory;
  let AliceToken;
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    AliceFactory = await ethers.getContractFactory("AliceToken");
    AliceToken = await AliceFactory.deploy();
    await AliceToken.deployed();
    // ;[(owner, addr1, addr2)].forEach(async (account) => {
    //   await AliceToken.transfer(account.address, 100)
    // })
    await AliceToken.transfer(addr1.address, 100);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const BobFactory = await ethers.getContractFactory("BobToken");
      const BobToken = await BobFactory.deploy(AliceToken.address);
      await BobToken.deployed();

      expect(await BobToken.owner()).to.equal(await owner.address);
    });
  });
  describe("Transactions", function () {
    describe("Transfer", function () {
      it("Should transfer tokens between accounts", async function () {
        const BobFactory = await ethers.getContractFactory("BobToken");
        const BobToken = await BobFactory.deploy(AliceToken.address);
        await BobToken.deployed();
        const allowanceBefore = await AliceToken.allowance(addr1.address, BobToken.address);
        console.log("Amount of AliceToken BobToken is allowed to transfer on our behalf Before: " + allowanceBefore.toString());

        await AliceToken.connect(addr1).approve(BobToken.address, 50);

        const allowanceAfter = await AliceToken.allowance(addr1.address, BobToken.address);
        console.log("Amount of MyToken BobToken is allowed to transfer on our behalf After: " + allowanceAfter.toString());

        // Transfer 50 tokens from owner to addr1
        await BobToken.connect(addr1).deposit(50);

        expect(await AliceToken.balanceOf(addr1.address)).to.equal(50);
        expect(await BobToken.balanceOf(addr1.address)).to.equal(50);

        // Transfer 50 tokens from addr1 to addr2
        await BobToken.connect(addr1).transfer(addr2.address, 50);
        expect(await BobToken.balanceOf(addr2.address)).to.equal(50);
      });
    });
    describe("deposit", function () {
      it("should mint BobTokent to the right account when AliceToken is depositted", async function () {
        const BobFactory = await ethers.getContractFactory("BobToken");
        const BobToken = await BobFactory.deploy(AliceToken.address);
        await BobToken.deployed();
        const allowanceBefore = await AliceToken.allowance(addr1.address, BobToken.address);
        console.log("Amount of AliceToken BobToken is allowed to transfer on our behalf Before: " + allowanceBefore.toString());

        await AliceToken.connect(addr1).approve(BobToken.address, 50);

        const allowanceAfter = await AliceToken.allowance(addr1.address, BobToken.address);
        console.log("Amount of MyToken BobToken is allowed to transfer on our behalf After: " + allowanceAfter.toString());

        // Transfer 50 tokens from owner to addr1
        await BobToken.connect(addr1).deposit(50);

        expect(await AliceToken.balanceOf(addr1.address)).to.equal(50);
        expect(await BobToken.balanceOf(addr1.address)).to.equal(50);

        // Transfer 50 tokens from addr1 to addr2
        await BobToken.connect(addr1).transfer(addr2.address, 50);
        expect(await BobToken.balanceOf(addr2.address)).to.equal(50);
      });
    });
    describe("withdraw", function () {
      it("", async function () {
        const BobFactory = await ethers.getContractFactory("BobToken");
        const BobToken = await BobFactory.deploy(AliceToken.address);
        await BobToken.deployed();
        await AliceToken.connect(addr1).approve(BobToken.address, 50);
        await BobToken.connect(addr1).deposit(50);

        await AliceToken.connect(addr1).approve(BobToken.address, 50);
        await BobToken.connect(addr1).withdraw(50);
        expect(await AliceToken.balanceOf(addr1.address)).to.equal(100);
        expect(await BobToken.balanceOf(addr1.address)).to.equal(0);
      });
    });
  });
});
