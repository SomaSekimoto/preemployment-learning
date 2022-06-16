// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract BobToken is ERC20, Ownable {
    using SafeMath for uint256;
    using Address for address;
    using SafeERC20 for IERC20;
    IERC20 public token;
    uint256 private interest;
    uint256 public interestRate;
    // アドレスごとの最後に利子を配った時間を記録
    mapping(address => uint256) public lastRewardedTime;

    abstract constructor(address _token, uint256 rate) public ERC20("BobToken", "BBT") {
        token = IERC20(_token);
        setInterestRate(rate);
    }

    function balance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function deposit(uint256 _amount) public {
        // Amount must be greater than zero
        require(_amount > 0, "amount cannot be 0");

        // Transfer AliceToken to smart contract
        token.safeTransferFrom(msg.sender, address(this), _amount);
        // Mint BobToken to msg sender
        interest = _amount.mul(interestRate) / 10**18;
        _mint(msg.sender, interest);
        lastRewardedTime[msg.sender] = block.timestamp;
    }

    function withdraw(uint256 _amount) public {
        // Transfer MyTokens from this smart contract to msg sender
        token.safeTransfer(msg.sender, _amount);
        if (token.balanceOf(msg.sender) == 0) {
            delete lastRewardedTime[msg.sender];
        }
    }

    function getReward() public {
        uint256 balance = token.balanceOf(msg.sender);
        require(balance > 0, "deposit balance cannot be 0");
        uint256 nextRewardTime = lastRewardedTime[msg.sender] + 1 days;
        require(
            nextRewardTime > block.timestamp,
            "1 day has not passed since you got reward last time."
        );
        _mint(msg.sender, (this.balance().mul(interestRate)) / 10**18);
        lastRewardedTime[msg.sender] = block.timestamp;
    }

    function setInterestRate(uint256 _rate) public onlyOwner {
        interestRate = _rate;
    }
}
