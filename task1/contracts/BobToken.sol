// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.1;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BobToken is ERC20, Ownable {
    constructor() public ERC20("BobToken", "BBT") {
        _mint(msg.sender, 1000 * 1e18);
    }

    function transferB(address _address, uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");
        transfer(_address, _amount * 1e18);
    }

    function approveB(address _address, uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");
        approve(_address, _amount * 1e18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
