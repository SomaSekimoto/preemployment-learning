const chai = require("chai");
const expect = chai.expect;
const BigNumber = ethers.BigNumber;
const FixedNumber = ethers.FixedNumber;

// chai.use(require("chai-bignumber")());

describe("Bob Token contract", function () {
  let AliceFactory;
  let AliceToken;
  let interest = FixedNumber.from("0.02");
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    AliceFactory = await ethers.getContractFactory("AliceToken");
    AliceToken = await AliceFactory.deploy();
    await AliceToken.deployed();

    await AliceToken.transfer(addr1.address, (100 * 1e18).toString());
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const BobFactory = await ethers.getContractFactory("BobToken");
      const BobToken = await BobFactory.deploy(AliceToken.address, interest);
      await BobToken.deployed();

      expect(await BobToken.owner()).to.equal(await owner.address);
    });
  });
  describe("Transactions", function () {
    describe("deposit", function () {
      it("should mint BobToken to the right account when AliceToken is depositted", async function () {
        const BobFactory = await ethers.getContractFactory("BobToken");
        const BobToken = await BobFactory.deploy(AliceToken.address, interest);
        await BobToken.deployed();
        const allowanceBefore = await AliceToken.allowance(addr1.address, BobToken.address);
        console.log("Amount of AliceToken BobToken is allowed to transfer on our behalf Before: " + allowanceBefore.toString());

        // AliceContract allow addr1 to transfer ALT to BobContract
        await AliceToken.connect(addr1).approve(BobToken.address, (30 * 1e18).toString());

        const allowanceAfter = await AliceToken.allowance(addr1.address, BobToken.address);
        console.log("Amount of AliceToken BobToken is allowed to transfer on our behalf After: " + allowanceAfter.toString());

        // deposit ALT
        await BobToken.connect(addr1).deposit((30 * 1e18).toString());

        //the amount of ALT in addr1 wallet == 70 * 1e18
        expect(await AliceToken.balanceOf(addr1.address)).to.equal((70 * 1e18).toString());
        //the amount of BBT in addr1 wallet == 30 * 0.02 * 1e18
        expect(await BobToken.balanceOf(addr1.address)).to.equal((30 * interest * 1e18).toString());
      });
    });
    describe("transfer", function () {
      it("Should transfer tokens between accounts", async function () {
        const BobFactory = await ethers.getContractFactory("BobToken");
        const BobToken = await BobFactory.deploy(AliceToken.address, interest);
        await BobToken.deployed();

        // AliceContract allow addr1 to transfer ALT to BobContract
        await AliceToken.connect(addr1).approve(BobToken.address, (30 * 1e18).toString());

        // deposit ALT
        await BobToken.connect(addr1).deposit((30 * 1e18).toString());

        // Transfer 0.3 BBT from addr1 to addr2
        await BobToken.connect(addr1).transfer(addr2.address, (0.3 * 1e18).toString());
        //the amount of BBT in addr2 wallet == 0.3 * 1e18
        expect(await BobToken.balanceOf(addr2.address)).to.equal((0.3 * 1e18).toString());
      });
    });
    // describe("withdraw", function () {
    //   it("should stop harvesting interest BBT when withdraw to the right account when AliceToken is withdrawn", async function () {
    //     const BobFactory = await ethers.getContractFactory("BobToken");
    //     const BobToken = await BobFactory.deploy(AliceToken.address);
    //     await BobToken.deployed();
    //     await AliceToken.connect(addr1).approve(BobToken.address, BigNumber.from(50));
    //     await BobToken.connect(addr1).deposit(BigNumber.from(50));

    //     await AliceToken.connect(addr1).approve(BobToken.address, BigNumber.from(50));
    //     await BobToken.connect(addr1).withdraw(BigNumber.from(50));
    //     expect(await AliceToken.balanceOf(addr1.address)).to.equal(100);
    //     expect(await BobToken.balanceOf(addr1.address)).to.equal(0);
    //   });
    // });
  });
});
