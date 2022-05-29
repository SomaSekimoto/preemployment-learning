// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// import "./AliceToken.sol";

contract BobToken is ERC20, Ownable {
    using Address for address;
    // using SafeMath for uint256; // As of Solidity v0.8.0, mathematical operations can be done safely without the need for SafeMath
    using SafeERC20 for IERC20;
    IERC20 public token;

    constructor(address _token) public ERC20("BobToken", "BBT") {
        token = IERC20(_token);
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
        console.log(msg.sender);
        console.log(address(this));
        console.log(_amount);

        console.log(address(token));
        console.log(token.balanceOf(msg.sender));
        token.safeTransferFrom(msg.sender, address(this), _amount);

        // Mint BobToken to msg sender
        _mint(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) public {
        // Burn BobTokens from msg sender
        _burn(msg.sender, _amount);

        // Transfer MyTokens from this smart contract to msg sender
        token.safeTransfer(msg.sender, _amount);
    }
}
