// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.1;

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

    // constructor(address _token, uint256 rate) public ERC20("BobToken", "BBT") {
    constructor(
        address _token,
        uint256 divisor,
        uint256 dividend
    ) public ERC20("BobToken", "BBT") {
        token = IERC20(_token);
        // setInterestRate(rate);
        setInterestRate(divisor, dividend);
    }

    function transferB(address _address, uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");
        transfer(_address, _amount * 1e18);
    }

    function approveB(address _address, uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");
        approve(_address, _amount * 1e18);
    }

    function balance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function approve(uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");
        token.approve(address(this), _amount * 1e18);
    }

    function deposit(uint256 _amount) public {
        // Amount must be greater than zero
        require(_amount > 0, "amount cannot be 0");

        // Transfer AliceToken to smart contract
        token.safeTransferFrom(msg.sender, address(this), _amount * 1e18);
        // Mint BobToken to msg sender
        interest = _amount * interestRate;

        _mint(msg.sender, interest);
        lastRewardedTime[msg.sender] = block.timestamp;
    }

    function withdraw(uint256 _amount) public {
        // Transfer MyTokens from this smart contract to msg sender
        token.safeTransfer(msg.sender, _amount * 1e18);
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

        _mint(msg.sender, ((this.balance() / 1e18) * interestRate));
        lastRewardedTime[msg.sender] = block.timestamp;
    }

    function setInterestRate(uint256 divisor, uint256 dividend)
        public
        onlyOwner
    {
        interestRate = (divisor * 1e18) / dividend;
    }
}
