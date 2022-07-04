// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.1;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AliceToken is ERC20, Ownable {
    constructor() public ERC20("AliceToken", "ALT") {
        _mint(msg.sender, 1000 * 1e18);
    }

    function transferA(address _address, uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");
        transfer(_address, _amount * 1e18);
    }

    function approveA(address to, uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");
        approve(to, _amount * 1e18);
    }
}
