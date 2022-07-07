pragma solidity ^0.8.1;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./BobToken.sol";



contract Bank is Ownable {
    using Address for address;
    using SafeERC20 for IERC20;
    IERC20 public aToken;
    IERC20 public bToken;
    address public bankOwner;
    
    uint256 private interest;
    uint256 public interestRate;
    // アドレスごとの最後に利子を配った時間を記録
    struct Staker {
        address id;
        uint256 balance;
        uint256 lastRewardedTime;
    }
    mapping(address => Staker) public stakers;

    constructor(uint256 divisor,uint256 dividend, address aTokenAddress, address bTokenAddress) {
        aToken = IERC20(aTokenAddress);
        bToken = IERC20(bTokenAddress);
        bankOwner = msg.sender;

        setInterestRate(divisor, dividend);
    }

    function setInterestRate(uint256 divisor, uint256 dividend) public onlyOwner {
        interestRate = 1e18 * divisor / dividend;
    }

    function deposit(uint256 _amount) public payable {
        // Amount must be greater than zero
        require(_amount > 0, "amount cannot be 0");

        // Transfer AliceToken to smart contract
        aToken.safeTransferFrom(msg.sender, address(this), _amount * 1e18);
        // Mint BobToken to msg sender
        interest = _amount * interestRate;
        BobToken instanceuser = BobToken(address(bToken));
        instanceuser.mint(msg.sender, interest);
        if(stakers[msg.sender].id != 0x0000000000000000000000000000000000000000){
            stakers[msg.sender].balance += (_amount * 1e18);
            stakers[msg.sender].lastRewardedTime = block.timestamp;
        }else{
            createNewStaker(msg.sender, _amount * 1e18,  block.timestamp);
        }
    }

    function createNewStaker(address _address, uint256 _amount, uint256 timestamp) internal {
        Staker memory newStaker = Staker({id: _address, balance: _amount, lastRewardedTime: timestamp});
        stakers[_address] = newStaker;
    }

    function withdraw(uint256 _amount) public {
        // Transfer MyTokens from this smart contract to msg sender
        uint256 AliceBalance = stakers[msg.sender].balance;
        require (AliceBalance >= _amount * 1e18, "Insufficent Funds");
        stakers[msg.sender].balance -= _amount * 1e18;

        aToken.safeTransfer(msg.sender, _amount * 1e18);
        if (AliceBalance == 0) {
            delete stakers[msg.sender];
        }
    }

    function getReward() public {
        uint256 AliceBalance = stakers[msg.sender].balance;
        require(AliceBalance > 0, "deposit balance cannot be 0");
        uint256 nextRewardTime = stakers[msg.sender].lastRewardedTime + 1 days;
        require(nextRewardTime < block.timestamp,"1 day has not passed since you got reward last time.");
        BobToken instanceuser = BobToken(address(bToken));
        instanceuser.mint(msg.sender, (AliceBalance / 1e18) * interestRate);
        stakers[msg.sender].lastRewardedTime = block.timestamp;
    }
}
