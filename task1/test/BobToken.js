const chai = require("chai");
const expect = chai.expect;
const BigNumber = ethers.BigNumber;
const FixedNumber = ethers.FixedNumber;

function toBigNum(num) {
  if (num < 1) {
    return FixedNumber.from(num.toString());
  }
  return BigNumber.from(num.toString());
}

describe("Bob Token contract", function () {
  let AliceFactory;
  let AliceToken;
  let divisor = 2;
  let dividend = 100;
  let interest = divisor / dividend;
  let BobFactory;
  let BobToken;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    AliceFactory = await ethers.getContractFactory("AliceToken");
    AliceToken = await AliceFactory.deploy();
    await AliceToken.deployed();

    await AliceToken.transferA(addr1.address, toBigNum(100));

    BobFactory = await ethers.getContractFactory("BobToken");
    BobToken = await BobFactory.deploy(AliceToken.address, divisor, dividend);
    await BobToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const BobFactory = await ethers.getContractFactory("BobToken");
      const BobToken = await BobFactory.deploy(AliceToken.address, divisor, dividend);
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
        // await AliceToken.connect(addr1).approve(BobToken.address, BigNumber.from((30 * 1e18).toString()));
        await AliceToken.connect(addr1).approveA(BobToken.address, toBigNum(30));

        const allowanceAfter = await AliceToken.allowance(addr1.address, BobToken.address);
        console.log("Amount of AliceToken BobToken is allowed to transfer on our behalf After: " + allowanceAfter.toString());
        console.log(await AliceToken.balanceOf(addr1.address));

        // deposit ALT
        await BobToken.connect(addr1).deposit(toBigNum(30));

        //the amount of ALT in addr1BigNumber.from wallet ==  xpect(await AliceToken.balanceOf(addr1.address)).to.equal((70 * 1e18).toString());
        expect(await AliceToken.balanceOf(addr1.address)).to.equal(toBigNum(70 * 1e18));

        //the amount of BBT in addr1 wallet == 30 *BigNumber.from 0. xpect(await BobToken.balanceOf(addr1.address)).to.equal((30 * interest * 1e18).toString());
        expect(await BobToken.balanceOf(addr1.address)).to.equal(toBigNum(30 * interest * 1e18));
      });
    });
    describe("transfer", function () {
      it("Should transfer tokens between accounts", async function () {
        // AliceContract allow addr1 to transfer ALT to BobContract
        // await AliceToken.connect(addr1).approve(BobToken.address, (30 * 1e18).toString());
        await AliceToken.connect(addr1).approveA(BobToken.address, toBigNum(30));

        // deposit ALT
        // await BobToken.connect(addr1).deposit((30 * 1e18).toString());
        await BobToken.connect(addr1).deposit(toBigNum(30));

        // Transfer 0.3 BBT from addr1 to addr2
        // await BobToken.connect(addr1).transfer(addr2.address, (0.3 * 1e18).toString());
        console.log("await BobToken.balanceOf(addr1)");
        console.log(await BobToken.balanceOf(addr1.address));
        await BobToken.connect(addr1).transfer(addr2.address, toBigNum(0.3 * 1e18));
        //the amount of BBT in addr2 wallet ==BigNumber.from 0. xpect(await BobToken.balanceOf(addr2.address)).to.equal((0.3 * 1e18).toString());
        expect(await BobToken.balanceOf(addr2.address)).to.equal(toBigNum(0.3 * 1e18));
      });
    });
    describe("withdraw", function () {
      it("should withdraw to the right account when AliceToken is withdrawn", async function () {
        // await AliceToken.connect(addr1).approve(BobToken.address, (50 * 1e18).toString());
        await AliceToken.connect(addr1).approveA(BobToken.address, toBigNum(50));
        // await BobToken.connect(addr1).deposit((50 * 1e18).toString());
        await BobToken.connect(addr1).deposit(toBigNum(50));

        // await AliceToken.connect(addr1).approve(BobToken.address, (50 * 1e18).toString());
        await AliceToken.connect(addr1).approveA(BobToken.address, toBigNum(50));
        // await BobToken.connect(addr1).withdraw((50 * 1e18).toString());
        await BobToken.connect(addr1).withdraw(toBigNum(50));

        // expect(await AliceToken.balanceOf(addr1.address)).to.equal((100 * 1e18).toString());
        expect(await AliceToken.balanceOf(addr1.address)).to.equal(toBigNum(100 * 1e18));
        // expect(await BobToken.balanceOf(addr1.address)).to.equal((1 * 1e18).toString());
        expect(await BobToken.balanceOf(addr1.address)).to.equal(toBigNum(1 * 1e18));
      });
    });
    describe("get reward", function () {
      it("Should transfer proper amount of tokens to msg.sender", async function () {
        // await AliceToken.connect(addr1).approve(BobToken.address, (30 * 1e18).toString());
        await AliceToken.connect(addr1).approveA(BobToken.address, toBigNum(30));
        // await BobToken.connect(addr1).deposit((30 * 1e18).toString());
        await BobToken.connect(addr1).deposit(toBigNum(30));
        const firstReward = 30 * interest;
        // expect(await BobToken.balanceOf(addr1.address)).to.equal((firstReward * 1e18).toString());
        expect(await BobToken.balanceOf(addr1.address)).to.equal(toBigNum(firstReward * 1e18));

        await BobToken.connect(addr1).getReward();
        // expect(await BobToken.balanceOf(addr1.address)).to.equal(((firstReward + 30 * interest) * 1e18).toString());
        expect(await BobToken.balanceOf(addr1.address)).to.equal(toBigNum(firstReward * 1e18 + 30 * interest * 1e18));
      });
      it("should stop rewarding when the balance of Alice Token depositted on Bob Contract is 0", async function () {});
      it("should stop rewarding until next rewad time", async function () {});
    });
  });
});
