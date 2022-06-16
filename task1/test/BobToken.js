const chai = require("chai");
const expect = chai.expect;
const BigNumber = ethers.BigNumber;
const FixedNumber = ethers.FixedNumber;

// chai.use(require("chai-bignumber")());

describe("Bob Token contract", function () {
  let AliceFactory;
  let AliceToken;
  let interest = FixedNumber.from("0.02");
  let BobFactory;
  let BobToken;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    AliceFactory = await ethers.getContractFactory("AliceToken");
    AliceToken = await AliceFactory.deploy();
    await AliceToken.deployed();

    await AliceToken.transfer(addr1.address, (100 * 1e18).toString());

    BobFactory = await ethers.getContractFactory("BobToken");
    BobToken = await BobFactory.deploy(AliceToken.address, interest);
    await BobToken.deployed();
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
    describe("withdraw", function () {
      it("should withdraw to the right account when AliceToken is withdrawn", async function () {
        await AliceToken.connect(addr1).approve(BobToken.address, (50 * 1e18).toString());
        await BobToken.connect(addr1).deposit((50 * 1e18).toString());

        await AliceToken.connect(addr1).approve(BobToken.address, (50 * 1e18).toString());
        await BobToken.connect(addr1).withdraw((50 * 1e18).toString());

        expect(await AliceToken.balanceOf(addr1.address)).to.equal((100 * 1e18).toString());
        expect(await BobToken.balanceOf(addr1.address)).to.equal((1 * 1e18).toString());
      });
    });
    describe("get reward", function () {
      it("Should transfer proper amount of tokens to msg.sender", async function () {
        await AliceToken.connect(addr1).approve(BobToken.address, (30 * 1e18).toString());
        await BobToken.connect(addr1).deposit((30 * 1e18).toString());
        const firstReward = 30 * interest;
        expect(await BobToken.balanceOf(addr1.address)).to.equal((firstReward * 1e18).toString());

        await BobToken.connect(addr1).getReward();
        expect(await BobToken.balanceOf(addr1.address)).to.equal(((firstReward + 30 * interest) * 1e18).toString());
      });
      it("should stop rewarding when the balance of Alice Token depositted on Bob Contract is 0", async function () {});
      it("should stop rewarding until next rewad time", async function () {});
    });
  });
});
