// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AliceToken is ERC20 {
    constructor() public ERC20("AliceToken", "ALT") {
        _mint(msg.sender, 1000 * 10**18);
    }
}
