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

    constructor(address _token, uint256 rate) public ERC20("BobToken", "BBT") {
        token = IERC20(_token);
        setInterestRate(rate);
    }

    // constructor(uint256 totalSupply) public ERC20("BobToken", "BBT") {
    //     console.log("totalSupply is %s", totalSupply);
    //     _mint(msg.sender, totalSupply);
    //     owner = msg.sender;
    //     console.log("contract owner is %s", owner);
    // }
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
    }

    function withdraw(uint256 _amount) public {
        // Burn BobTokens from msg sender
        _burn(msg.sender, _amount);

        // Transfer MyTokens from this smart contract to msg sender
        token.safeTransfer(msg.sender, _amount);
    }

    function setInterestRate(uint256 _rate) public onlyOwner {
        interestRate = _rate;
    }
}
