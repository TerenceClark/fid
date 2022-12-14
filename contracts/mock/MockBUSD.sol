// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockBUSD is ERC20, Ownable {
    constructor() ERC20("Mock BUSD", "MBUSD") {
        _mint(msg.sender, 10**8 * 10**18);
    }

    function mint(uint256 amount) public onlyOwner {
        _mint(owner(), amount);
    }

    function burn(uint256 amount) public onlyOwner {
        _burn(owner(), amount);
    }
}
