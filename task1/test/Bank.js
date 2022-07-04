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

describe("Bank contract", function () {
  let AliceFactory;
  let AliceToken;
  let divisor = 2;
  let dividend = 100;
  let BankContract;
  let Bank;
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
    BobToken = await BobFactory.deploy();
    await BobToken.deployed();

    BankContract = await ethers.getContractFactory("Bank");
    Bank = await BankContract.deploy(divisor, dividend, AliceToken.address, BobToken.address);
    await Bank.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const BankContract = await ethers.getContractFactory("Bank");
      const Bank = await BankContract.deploy(divisor, dividend, AliceToken.address, BobToken.address);
      await Bank.deployed();

      expect(await Bank.owner()).to.equal(await owner.address);
    });
  });
  describe("Transactions", function () {
    describe("deposit", function () {
      it("should mint BobToken to the right account when AliceToken is depositted", async function () {
        await AliceToken.connect(addr1).approveA(Bank.address, toBigNum(30));

        const allowanceAfter = await AliceToken.allowance(addr1.address, Bank.address);

        await Bank.connect(addr1).deposit(toBigNum(30));
        expect(await AliceToken.balanceOf(addr1.address)).to.equal(toBigNum(70 * 1e18));
        expect(await BobToken.balanceOf(addr1.address)).to.equal(toBigNum(30 * interest * 1e18));
      });
    });
    describe("transfer", function () {
      it("Should transfer tokens between accounts", async function () {
        await AliceToken.connect(addr1).approveA(Bank.address, toBigNum(30));

        await Bank.connect(addr1).deposit(toBigNum(30));

        await BobToken.connect(addr1).transfer(addr2.address, toBigNum(0.3 * 1e18));
        expect(await BobToken.balanceOf(addr2.address)).to.equal(toBigNum(0.3 * 1e18));
      });
    });
    describe("withdraw", function () {
      it("should withdraw to the right account when AliceToken is withdrawn", async function () {
        await AliceToken.connect(addr1).approveA(Bank.address, toBigNum(50));
        await Bank.connect(addr1).deposit(toBigNum(50));

        await AliceToken.connect(addr1).approveA(Bank.address, toBigNum(50));
        await Bank.connect(addr1).withdraw(toBigNum(50));

        expect(await AliceToken.balanceOf(addr1.address)).to.equal(toBigNum(100 * 1e18));
        expect(await BobToken.balanceOf(addr1.address)).to.equal(toBigNum(1 * 1e18));
      });
    });
    describe("get reward", function () {
      it("Should transfer proper amount of tokens to msg.sender", async function () {
        await AliceToken.connect(addr1).approveA(Bank.address, toBigNum(30));
        await Bank.connect(addr1).deposit(toBigNum(30));
        const firstReward = 30 * interest;
        expect(await BobToken.balanceOf(addr1.address)).to.equal(toBigNum(firstReward * 1e18));

        await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
        await Bank.connect(addr1).getReward();
        expect(await BobToken.balanceOf(addr1.address)).to.equal(toBigNum(firstReward * 1e18 + 30 * interest * 1e18));
      });
      it("should stop rewarding when the balance of Alice Token depositted on Bank Contract is 0", async function () {
        await AliceToken.connect(addr1).approveA(Bank.address, toBigNum(30));
        await Bank.connect(addr1).deposit(toBigNum(30));
        const firstReward = 30 * interest;
        expect(await BobToken.balanceOf(addr1.address)).to.equal(toBigNum(firstReward * 1e18));
        await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
        await Bank.connect(addr1).getReward();

        await AliceToken.connect(addr1).approveA(Bank.address, toBigNum(30));
        await Bank.connect(addr1).withdraw(toBigNum(30));

        await expect(Bank.connect(addr1).getReward()).to.be.revertedWith("deposit balance cannot be 0");
      });
      it("should stop rewarding until next rewad time", async function () {
        await AliceToken.connect(addr1).approveA(Bank.address, toBigNum(30));
        await Bank.connect(addr1).deposit(toBigNum(30));
        const firstReward = 30 * interest;
        expect(await BobToken.balanceOf(addr1.address)).to.equal(toBigNum(firstReward * 1e18));

        await expect(Bank.connect(addr1).getReward()).to.be.revertedWith("1 day has not passed since you got reward last time.");
      });
    });
  });
});
